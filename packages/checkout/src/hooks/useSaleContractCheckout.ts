import { CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'

import { useSelectPaymentModal } from './useSelectPaymentModal'
import { useCheckoutOptionsSalesContract } from "./useCheckoutOptionsSalesContract"
import { ERC_1155_SALE_CONTRACT, ERC_721_SALE_CONTRACT } from '../constants/abi'

import { Abi, Hex } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

interface UseSaleContractCheckoutArgs extends CheckoutOptionsSalesContractArgs {
  chain: number | string,
  tokenType: 'ERC1155' | 'ERC721'
}

interface UseSaleContractCheckoutReturn {
  data?: undefined,
  isLoading: boolean,
  isError: boolean
}

export const useSaleContractCheckout = ({
  chain,
  tokenType,
  contractAddress,
  wallet,
  collectionAddress,
  items,
}: UseSaleContractCheckoutArgs): UseSaleContractCheckoutReturn => {
  const { data: checkoutOptions, isLoading: isLoadingCheckoutOptions, isError: isErrorCheckoutOtions } = useCheckoutOptionsSalesContract(chain, {
    contractAddress,
    wallet,
    collectionAddress,
    items
  })
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: saleConfigData, isLoading: isLoadingSaleConfig, isError: isErrorSaleConfig } = useSaleContractConfig({ chainId, tokenType, contractAddress, tokenIds: items.map(i => i.tokenId) })

  // Get sale contract currency data...
  // Get token sale data
  // Pass wrapper to open select modal
  const isLoading = isLoadingCheckoutOptions || isLoadingSaleConfig
  const error = isErrorCheckoutOtions || isErrorSaleConfig


  const openCheckoutModal = () => {
    if (isLoading || error) return

    // return openCheckoutModal({
    // })
  }

  return ({
    data: undefined,
    isLoading,
    isError: error
  })
}

interface UseSaleContractConfigArgs {
  chainId: number
  contractAddress: string
  tokenType: 'ERC1155'| 'ERC721',
  tokenIds: string[]
}

interface SaleConfig {
  tokenId: string
  price: string
}

interface UseSaleContractConfigData {
  currencyAddress: string
  saleConfigs: SaleConfig[]
}

interface UseSaleContractConfigReturn {
  data?: UseSaleContractConfigData,
  isLoading: boolean,
  isError: boolean
}

export const useSaleContractConfig = ({ chainId, tokenType, contractAddress, tokenIds, }: UseSaleContractConfigArgs): UseSaleContractConfigReturn => {
  const { data: paymentTokenERC1155, isLoading: isLoadingPaymentTokenERC1155, isError: isErrorPaymentTokenERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'paymentToken',
    query: {
      enabled: tokenType === 'ERC1155'
    }
  })

  // [cost, supplyCap, startTime, endTime, merkleRoot]
  type SaleDetailsERC1155 = [bigint, bigint, bigint, bigint, string]

  const { data: globalSaleDetailsERC1155, isLoading: isLoadingGlobalSaleDetailsERC1155, isError: isErrorGlobalSaleDetailsERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'globalSaleDetails',
    query: {
      enabled: tokenType === 'ERC1155'
    }
  })

  const baseTokenSaleContract = {
    chainId,
    abi: ERC_1155_SALE_CONTRACT as Abi,
    address: contractAddress as Hex,
    functionName: 'tokenSaleDetails',
  }

  const tokenSaleContracts = tokenIds.map(tokenId => ({
    ...baseTokenSaleContract,
    args: [BigInt(tokenId)]
  }))

  const { data: tokenSaleDetailsERC1155, isLoading: isLoadingTokenSaleDetailsERC1155, isError: isErrorTokenSaleDetailsERC1155 } = useReadContracts({
    contracts: tokenSaleContracts,
    query: {
      enabled: tokenType === 'ERC1155'
    }
  })

  // [supplyCap, cost, paymentToken, startTime, endTime, merkleRoot]
  type SaleDetailsERC721 = [bigint, bigint, string, bigint, string, string]

  const { data: saleDetailsERC721, isLoading: isLoadingSaleDetailsERC721, isError: isErrorSaleDetailsERC721 } = useReadContract({
    chainId,
    abi: ERC_721_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'saleDetails',
    query: {
      enabled: tokenType === 'ERC721'
    }
  })

  const isLoadingERC1155 = isLoadingPaymentTokenERC1155 || isLoadingGlobalSaleDetailsERC1155 || isLoadingTokenSaleDetailsERC1155
  const isLoadingERC721 = isLoadingSaleDetailsERC721
  const isErrorERC1155 = isErrorPaymentTokenERC1155 || isErrorGlobalSaleDetailsERC1155 || isErrorTokenSaleDetailsERC1155
  const isErrorERC721 = isErrorSaleDetailsERC721

  if (isLoadingERC1155 || isLoadingERC721 || isErrorERC1155 || isErrorERC721) {
    return ({
      data: undefined,
      isLoading: tokenType === 'ERC1155' ? isLoadingERC1155 : isLoadingERC721,
      isError: tokenType === 'ERC1155' ? isErrorERC1155 : isErrorERC721
    })
  }

  const getSaleConfigs = (): SaleConfig[]  => {
    let saleInfos: SaleConfig[] = []

    if (isLoadingERC1155 || isLoadingERC721 || isErrorERC1155 || isErrorERC721) return saleInfos
    
    if (tokenType === 'ERC1155') {
      // In the sale contract, the global sale has priority over the token sale
      // So we need to check if the global sale is set, and if it is, use that
      // Otherwise, we use the token sale
      const [costERC721, _, startTime, endTime] = globalSaleDetailsERC1155 as SaleDetailsERC1155
      const isGlobalSaleValid = endTime === BigInt(0) || (startTime <= BigInt(Math.floor(Date.now() / 1000)) || endTime >= BigInt(Math.floor(Date.now() / 1000)))
      saleInfos = tokenIds.map((tokenId, index) => {
        const tokenPrice = (tokenSaleDetailsERC1155?.[index].result as SaleDetailsERC1155)[0] || BigInt(0)
        return ({
          tokenId,
          price: (isGlobalSaleValid ? costERC721 : tokenPrice).toString()
        })
      })
    } else {
      saleInfos = tokenIds.map((tokenId, index) => {
        const tokenPrice = (saleDetailsERC721 as SaleDetailsERC721)[1] || BigInt(0)
        return ({
          tokenId,
          price: tokenPrice.toString()
        })
      })
    }

    return saleInfos
  }  

  return ({
    data: {
      currencyAddress: tokenType === 'ERC1155' ? (paymentTokenERC1155 as string) : (saleDetailsERC721 as SaleDetailsERC721)[2],
      saleConfigs: getSaleConfigs()
    },
    isLoading: tokenType === 'ERC1155' ? isLoadingERC1155 : isLoadingERC721,
    isError: tokenType === 'ERC1155' ? isErrorERC1155 : isErrorERC721
  })
}
import { CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'

import { useERC1155SaleContractPaymentModal } from './useSelectPaymentModal'
import { useCheckoutOptionsSalesContract } from "./useCheckoutOptionsSalesContract"
import { ERC_1155_SALE_CONTRACT } from '../constants/abi'

import { Abi, Hex } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

interface UseERC1155SaleContractCheckoutArgs extends CheckoutOptionsSalesContractArgs {
  chain: number | string,
}

interface UseERC1155SaleContractCheckoutReturn {
  openCheckoutModal: () => void,
  isLoading: boolean,
  isError: boolean
}

export const useERC1155SaleContractCheckout = ({
  chain,
  contractAddress,
  wallet,
  collectionAddress,
  items,
}: UseERC1155SaleContractCheckoutArgs): UseERC1155SaleContractCheckoutReturn => {
  const { openERC1155SaleContractPaymentModal } = useERC1155SaleContractPaymentModal()
  const { data: checkoutOptions, isLoading: isLoadingCheckoutOptions, isError: isErrorCheckoutOtions } = useCheckoutOptionsSalesContract(chain, {
    contractAddress,
    wallet,
    collectionAddress,
    items
  })
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: saleConfigData, isLoading: isLoadingSaleConfig, isError: isErrorSaleConfig } = useSaleContractConfig({ chainId, contractAddress, tokenIds: items.map(i => i.tokenId) })

  // Get sale contract currency data...
  // Get token sale data
  // Pass wrapper to open select modal
  const isLoading = isLoadingCheckoutOptions || isLoadingSaleConfig
  const error = isErrorCheckoutOtions || isErrorSaleConfig

  const openCheckoutModal = () => {
    if (isLoading || error) {
        console.error('Error loading checkout options or sale config', { isLoading, error })
      return
    }

    return () => {
      openERC1155SaleContractPaymentModal({
        collectibles: items.map(item => ({
          tokenId: item.tokenId,
          quantity: item.quantity
        })),
        chain: chainId,
        price: items.reduce((acc, item) => {
          const price = BigInt(saleConfigData?.saleConfigs.find(sale => sale.tokenId === item.tokenId)?.price || 0)
          return acc + BigInt(item.quantity) * price
        }, BigInt(0)).toString(),
        currencyAddress: saleConfigData?.currencyAddress || '',
        recipientAddress: wallet,
        collectionAddress,
        targetContractAddress: contractAddress,
      })
    }
  }

  return ({
    openCheckoutModal,
    isLoading,
    isError: error
  })
}

interface UseSaleContractConfigArgs {
  chainId: number
  contractAddress: string
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

export const useSaleContractConfig = ({ chainId, contractAddress, tokenIds, }: UseSaleContractConfigArgs): UseSaleContractConfigReturn => {
  const { data: paymentTokenERC1155, isLoading: isLoadingPaymentTokenERC1155, isError: isErrorPaymentTokenERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'paymentToken',
  })

  // [cost, supplyCap, startTime, endTime, merkleRoot]
  type SaleDetailsERC1155 = [bigint, bigint, bigint, bigint, string]

  const { data: globalSaleDetailsERC1155, isLoading: isLoadingGlobalSaleDetailsERC1155, isError: isErrorGlobalSaleDetailsERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'globalSaleDetails',
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
  })

  const isLoadingERC1155 = isLoadingPaymentTokenERC1155 || isLoadingGlobalSaleDetailsERC1155 || isLoadingTokenSaleDetailsERC1155
  const isErrorERC1155 = isErrorPaymentTokenERC1155 || isErrorGlobalSaleDetailsERC1155 || isErrorTokenSaleDetailsERC1155

  if (isLoadingERC1155 || isErrorERC1155) {
    return ({
      data: undefined,
      isLoading: isLoadingERC1155,
      isError: isErrorERC1155
    })
  }

  const getSaleConfigs = (): SaleConfig[]  => {
    let saleInfos: SaleConfig[] = []

    if (isLoadingERC1155 || isErrorERC1155 ) return saleInfos
    
    // In the sale contract, the global sale has priority over the token sale
    // So we need to check if the global sale is set, and if it is, use that
    // Otherwise, we use the token sale
    const [costERC1155, _, startTime, endTime] = globalSaleDetailsERC1155 as SaleDetailsERC1155
    const isGlobalSaleValid = endTime === BigInt(0) || (startTime <= BigInt(Math.floor(Date.now() / 1000)) || endTime >= BigInt(Math.floor(Date.now() / 1000)))
    saleInfos = tokenIds.map((tokenId, index) => {
      const tokenPrice = (tokenSaleDetailsERC1155?.[index].result as SaleDetailsERC1155)[0] || BigInt(0)
      return ({
        tokenId,
        price: (isGlobalSaleValid ? costERC1155 : tokenPrice).toString()
      })
    })

    return saleInfos
  }  

  return ({
    data: {
      currencyAddress: paymentTokenERC1155 as string,
      saleConfigs: getSaleConfigs()
    },
    isLoading: isLoadingERC1155,
    isError: isErrorERC1155
  })
}
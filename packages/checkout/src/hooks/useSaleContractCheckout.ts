import { CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { useContractInfo } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'

import { useCheckoutOptionsSalesContract } from "./useCheckoutOptionsSalesContract"
import { ERC_1155_SALE_CONTRACT, ERC_721_SALE_CONTRACT } from '../constants/abi'

import { Abi, Hex } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

export interface UseSaleContractCheckoutArgs extends CheckoutOptionsSalesContractArgs {
  chain: number | string,
  tokenType: 'ERC1155' | 'ERC721'
}

export const useSaleContractCheckout = ({
  chain,
  tokenType,
  contractAddress,
  wallet,
  collectionAddress,
  items,
}: UseSaleContractCheckoutArgs) => {
  const { data: checkoutOptions, isLoading: isLoadingCheckoutOptions, isError: isErrorCheckoutOtions } = useCheckoutOptionsSalesContract(chain, {
    contractAddress,
    wallet,
    collectionAddress,
    items
  })
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const data = useSaleContractConfig({ chainId, tokenType, contractAddress, tokenIds: items.map(i => i.tokenId) })

  // Get sale contract currency data...
  // Get token sale data
  // Pass wrapper to open select modal
  const isLoading = isLoadingCheckoutOptions
  const error = isErrorCheckoutOtions
}

interface UseSaleContractConfigArgs {
  chainId: number
  contractAddress: string
  tokenType: 'ERC1155'| 'ERC721',
  tokenIds: string[]
}

interface UseSaleContractConfigReturn {
  currencyAddress: string
  prices: string[]
}

export const useSaleContractConfig = ({ chainId, tokenType, contractAddress, tokenIds, }: UseSaleContractConfigArgs) => {
  const { data: paymentTokenERC1155, isLoading: isLoadingPaymentTokenERC1155, isError: isErrorPaymentTokenERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'paymentToken',
    query: {
      enabled: tokenType === 'ERC1155'
    }
  })

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


  const { data: saleDetailsERC721, isLoading: isLoadingSaleDetailsERC721, isError: isErrorSaleDetailsERC721 } = useReadContract({
    chainId,
    abi: ERC_721_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'saleDetails',
    query: {
      enabled: tokenType === 'ERC721'
    }
  })

  // get currency
  
  // get price
}
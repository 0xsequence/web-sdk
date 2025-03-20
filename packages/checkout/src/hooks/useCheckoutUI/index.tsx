import { useGetTokenMetadata, useGetContractInfo } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'

import React from 'react'
import { Hex } from 'viem'

import { useOrderSummary, type UseOrderSummaryArgs, type UseOrderSummaryReturn } from './useOrderSummary'
import { useCreditCardPayment, type UseCreditCardPaymentArgs, type UseCreditCardPaymentReturn } from './useCreditCardPayment'
import { Collectible, CreditCardProviders } from '../../contexts/SelectPaymentModal'
import { TransakConfig } from '../../contexts/CheckoutModal'
// crypto payment

// credit card payment

interface UseCheckoutUIArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectible: Collectible
  collectionAddress: string
  recipientAddress: string
  targetContractAddress: string
  txData: Hex
  transactionConfirmations?: number
  creditCardProvider?: CreditCardProviders
  transakConfig?: TransakConfig
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

interface UseCheckoutUIReturn {
  useOrderSummary: (args: UseOrderSummaryArgs) => UseOrderSummaryReturn
  // useCreditCardPayment: (args: UseCreditCardPaymentArgs) => UseCreditCardPaymentReturn
}

export const useCheckoutUI = ({
  chain,
  currencyAddress,
  totalPriceRaw,
  collectible,
  collectionAddress,
  recipientAddress,
  transactionConfirmations
}: UseCheckoutUIArgs): UseCheckoutUIReturn => {
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const {
    data: tokenMetadatas,
    isLoading: isLoadingTokenMetadatas,
    error: errorTokenMetadata
  } = useGetTokenMetadata({
    chainID: String(chainId),
    contractAddress: collectionAddress,
    tokenIDs: [collectible.tokenId]
  })

  const {
    data: dataCollectionInfo,
    isLoading: isLoadingCollectionInfo,
    error: errorCollectionInfo
  } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: collectionAddress
  })

  const {
    data: currencyInfo,
    isLoading: isLoadingCurrencyInfo,
    error: errorCurrencyInfo
  } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: currencyAddress
  })

  return {
    useOrderSummary: useOrderSummary({
      chain,
      currencyAddress,
      totalPriceRaw,
      collectible,
      collectionAddress,
      currencyInfo,
      tokenMetadatas,
      dataCollectionInfo,
      isLoadingCollectionInfo,
      errorCollectionInfo,
      isLoadingCurrencyInfo,
      isLoadingTokenMetadatas,
      errorTokenMetadata,
      errorCurrencyInfo
    })
  }
}

import { useGetContractInfo, useGetTokenMetadata } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import type { Hex } from 'viem'

import type { TransakConfig } from '../../contexts/CheckoutModal'
import type { Collectible, CreditCardProviders } from '../../contexts/SelectPaymentModal'

import { useCreditCardPayment, type UseCreditCardPaymentReturn } from './useCreditCardPayment'
import { useCryptoPayment, type UseCryptoPaymentReturn } from './useCryptoPayment'
import { useOrderSummary, type UseOrderSummaryReturn } from './useOrderSummary'

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
  slippageBps?: number
  creditCardProvider?: CreditCardProviders
  transakConfig?: TransakConfig
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

interface UseCheckoutUIReturn {
  orderSummary: UseOrderSummaryReturn
  creditCardPayment: UseCreditCardPaymentReturn
  cryptoPayment: UseCryptoPaymentReturn
}

export const useCheckoutUI = ({
  chain,
  currencyAddress,
  totalPriceRaw,
  collectible,
  collectionAddress,
  recipientAddress,
  targetContractAddress,
  txData,
  transactionConfirmations,
  creditCardProvider,
  transakConfig,
  slippageBps,
  onSuccess,
  onError
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

  const orderSummary = useOrderSummary({
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

  const creditCardPayment = useCreditCardPayment({
    chain,
    currencyAddress,
    totalPriceRaw,
    collectible,
    collectionAddress,
    recipientAddress,
    targetContractAddress,
    txData,
    creditCardProvider,
    transakConfig,
    onSuccess,
    onError,
    currencyInfo,
    tokenMetadatas,
    dataCollectionInfo,
    isLoadingCollectionInfo,
    errorCollectionInfo,
    isLoadingTokenMetadatas,
    errorTokenMetadata,
    isLoadingCurrencyInfo,
    errorCurrencyInfo
  })

  const cryptoPayment = useCryptoPayment({
    chain,
    currencyAddress,
    totalPriceRaw,
    collectible,
    collectionAddress,
    recipientAddress,
    targetContractAddress,
    txData,
    transactionConfirmations,
    onSuccess,
    onError,
    currencyInfo,
    tokenMetadatas,
    dataCollectionInfo,
    isLoadingCollectionInfo,
    errorCollectionInfo,
    isLoadingTokenMetadatas,
    errorTokenMetadata,
    isLoadingCurrencyInfo,
    errorCurrencyInfo,
    slippageBps
  })

  return {
    orderSummary,
    creditCardPayment,
    cryptoPayment
  }
}

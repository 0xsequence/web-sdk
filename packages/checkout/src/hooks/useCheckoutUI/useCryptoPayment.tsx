import { useProjectAccessKey } from '@0xsequence/connect'
import {
  compareAddress,
  ContractVerificationStatus,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  formatDisplay,
  sendTransactions
} from '@0xsequence/connect'
import {
  useIndexerClient,
  useConfig,
  useClearCachedBalances,
  useGetTokenBalancesSummary,
  useGetSwapPrices,
  useGetContractInfo,
  useGetSwapQuote
} from '@0xsequence/hooks'
import { TransactionStatus } from '@0xsequence/indexer'
import { ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import pako from 'pako'
import React, { useEffect, useState } from 'react'
import { Hex, encodeFunctionData, formatUnits, zeroAddress } from 'viem'
import { usePublicClient, useAccount, useReadContract, useWalletClient } from 'wagmi'

import { Collectible } from '../../contexts/SelectPaymentModal'
import { ERC_20_CONTRACT_ABI } from '../../constants/abi'
export interface UseCryptoPaymentArgs {
  chain: string | number
  currencyAddress: string
  totalPriceRaw: string
  collectible: Collectible
  collectionAddress: string
  recipientAddress: string
  targetContractAddress: string
  txData: Hex
  transactionConfirmations?: number
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  currencyInfo: ContractInfo | undefined
  tokenMetadatas: TokenMetadata[] | undefined
  dataCollectionInfo: ContractInfo | undefined
  isLoadingCollectionInfo: boolean
  errorCollectionInfo: Error | null
  isLoadingTokenMetadatas: boolean
  errorTokenMetadata: Error | null
  isLoadingCurrencyInfo: boolean
  errorCurrencyInfo: Error | null
}

export interface UseCryptoPaymentReturn {
  cryptoOptions: {
    data: CryptoOptions[]
    isLoading: boolean
    error: Error | null
  }
  purchaseAction: {
    action: () => Promise<string>
    isReady: boolean
    selectedCurrencyAddress: string | undefined
    setSelectedCurrencyAddress: (currencyAddress: string) => void
  }
}

interface CryptoOptions {
  chainId: number
  currencyAddress: string
  totalPriceRaw: string
  symbol: string
  decimals: number
  totalPriceDisplay: string
  currrencyLogoUrl?: string
  isBalanceSufficient: boolean
}

export const useCryptoPayment = ({
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
  errorCurrencyInfo
}: UseCryptoPaymentArgs): UseCryptoPaymentReturn => {
  const [actionInProgress, setActionInProgress] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)
  const [selectedCurrencyAddress, setSelectedCurrencyAddress] = useState<string | undefined>(undefined)
  const { address: userAddress, connector } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const currencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfo?.symbol
  const currencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfo?.decimals

  const { data: walletClient } = useWalletClient({
    chainId
  })
  const publicClient = usePublicClient({
    chainId
  })
  const indexerClient = useIndexerClient(chainId)

  const { data: allowanceData, isLoading: allowanceIsLoading } = useReadContract({
    abi: ERC_20_CONTRACT_ABI,
    functionName: 'allowance',
    chainId: chainId,
    address: currencyAddress as Hex,
    args: [userAddress, targetContractAddress],
    query: {
      enabled: !!userAddress && !isNativeCurrency
    }
  })

  const isApproved: boolean = (allowanceData as bigint) >= BigInt(totalPriceRaw) || isNativeCurrency

  const { data: currencyBalanceData, isLoading: currencyBalanceIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [currencyAddress],
      omitNativeBalances: false
    },
    omitMetadata: true
  })

  const buyCurrencyAddress = currencyAddress
  const sellCurrencyAddress = selectedCurrencyAddress || ''

  const { data: swapPrices = [], isLoading: swapPricesIsLoading } = useGetSwapPrices({
    userAddress: userAddress ?? '',
    buyCurrencyAddress,
    chainId: chainId,
    buyAmount: totalPriceRaw,
    withContractInfo: true
  })

  const disableSwapQuote = !selectedCurrencyAddress || compareAddress(selectedCurrencyAddress, buyCurrencyAddress)

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useGetSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: currencyAddress,
      buyAmount: totalPriceRaw,
      chainId: chainId,
      sellCurrencyAddress,
      includeApprove: true
    },
    {
      disabled: disableSwapQuote
    }
  )

  const mainCurrencyBalance = currencyBalanceData?.[0]?.balance || '0'
  const priceFormatted = formatUnits(BigInt(totalPriceRaw), currencyInfo?.decimals || 0)
  const priceDisplay = formatDisplay(priceFormatted, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6
  })

  const mainCurrencyOption = {
    chainId,
    currencyAddress,
    totalPriceRaw: totalPriceRaw,
    decimals: currencyDecimals || 18,
    totalPriceDisplay: priceDisplay,
    currrencyLogoUrl: currencyInfo?.logoURI,
    symbol: currencySymbol || '',
    isBalanceSufficient: Number(mainCurrencyBalance) > Number(totalPriceRaw)
  }

  const swapOptions = swapPrices.map(swapPrice => {
    const swapQuotePriceFormatted = formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 18)
    const swapQuoteAddress = swapPrice.info?.address || ''

    const swapQuotePriceDisplay = formatDisplay(swapQuotePriceFormatted, {
      disableScientificNotation: true,
      disableCompactNotation: true,
      significantDigits: 6
    })

    return {
      chainId,
      currencyAddress: swapQuoteAddress,
      totalPriceRaw: swapPrice.price.price,
      totalPriceDisplay: swapQuotePriceDisplay,
      currrencyLogoUrl: swapPrice.info?.logoURI,
      symbol: swapPrice.info?.symbol || '',
      decimals: swapPrice.info?.decimals || 18,
      // The balance check is done at the API level
      isBalanceSufficient: false
    }
  })

  const purchaseAction = async () => {
    if (!selectedCurrencyAddress) {
      throw new Error('No currency selected')
    }

    if (!walletClient) {
      throw new Error('No wallet client')
    }

    if (!userAddress) {
      throw new Error('User address is not connected')
    }

    if (!publicClient) {
      throw new Error('Public client is not connected')
    }

    if (!connector) {
      throw new Error('Connector is not connected')
    }

    const isMainCurrency = compareAddress(selectedCurrencyAddress, currencyAddress)
    try {
      if (isMainCurrency) {
        const walletClientChainId = await walletClient.getChainId()
        if (walletClientChainId !== chainId) {
          await walletClient.switchChain({ id: chainId })
        }

        const approveTxData = encodeFunctionData({
          abi: ERC_20_CONTRACT_ABI,
          functionName: 'approve',
          args: [targetContractAddress, totalPriceRaw]
        })

        const transactions = [
          ...(isApproved
            ? []
            : [
                {
                  to: currencyAddress as Hex,
                  data: approveTxData,
                  chainId
                }
              ]),
          {
            to: targetContractAddress as Hex,
            data: txData,
            chainId,
            ...(isNativeCurrency
              ? {
                  value: BigInt(totalPriceRaw)
                }
              : {})
          }
        ]

        const txHash = await sendTransactions({
          chainId,
          senderAddress: userAddress,
          publicClient,
          walletClient,
          indexerClient,
          connector,
          transactions,
          transactionConfirmations,
          waitConfirmationForLastTransaction: false
        })

        onSuccess?.(txHash)
        return txHash
      } else {
        const swapPrice = swapPrices.find(swapPrice => compareAddress(swapPrice.info?.address || '', selectedCurrencyAddress))
        if (!swapPrice) {
          throw new Error('No swap price found')
        }

        if (!swapQuote) {
          throw new Error('No swap quote found')
        }

        const walletClientChainId = await walletClient.getChainId()
        if (walletClientChainId !== chainId) {
          await walletClient.switchChain({ id: chainId })
        }

        const approveTxData = encodeFunctionData({
          abi: ERC_20_CONTRACT_ABI,
          functionName: 'approve',
          args: [targetContractAddress, totalPriceRaw]
        })

        const isSwapNativeToken = compareAddress(zeroAddress, swapPrice.price.currencyAddress)

        const transactions = [
          // Swap quote optional approve step
          ...(swapQuote?.approveData && !isSwapNativeToken
            ? [
                {
                  to: swapPrice.price.currencyAddress as Hex,
                  data: swapQuote.approveData as Hex,
                  chain: chainId
                }
              ]
            : []),
          // Swap quote tx
          {
            to: swapQuote.to as Hex,
            data: swapQuote.transactionData as Hex,
            chain: chainId,
            ...(isSwapNativeToken
              ? {
                  value: BigInt(swapQuote.transactionValue)
                }
              : {})
          },
          // Actual transaction optional approve step
          ...(isApproved || isNativeCurrency
            ? []
            : [
                {
                  to: currencyAddress as Hex,
                  data: approveTxData as Hex,
                  chainId: chainId
                }
              ]),
          // transaction on the contract
          {
            to: targetContractAddress as Hex,
            data: txData as Hex,
            chainId,
            ...(isNativeCurrency
              ? {
                  value: BigInt(totalPriceRaw)
                }
              : {})
          }
        ]

        const txHash = await sendTransactions({
          chainId,
          senderAddress: userAddress,
          publicClient,
          walletClient,
          indexerClient,
          connector,
          transactions,
          transactionConfirmations,
          waitConfirmationForLastTransaction: false
        })

        onSuccess?.(txHash)
        return txHash
      }
    } catch (error) {
      onError?.(error as Error)
      throw error
    }
  }

  return {
    cryptoOptions: {
      data: [mainCurrencyOption, ...swapOptions],
      isLoading: isLoadingCurrencyInfo || isLoadingTokenMetadatas || isLoadingCollectionInfo,
      error: errorCurrencyInfo || errorTokenMetadata || errorCollectionInfo
    },
    purchaseAction: {
      action: purchaseAction,
      isReady: !!selectedCurrencyAddress && !isLoadingSwapQuote && (!allowanceIsLoading || isNativeCurrency),
      selectedCurrencyAddress,
      setSelectedCurrencyAddress
    }
  }
}

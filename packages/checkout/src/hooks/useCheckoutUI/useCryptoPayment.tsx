import { compareAddress, ContractVerificationStatus, formatDisplay, sendTransactions } from '@0xsequence/connect'
import {
  DEFAULT_SLIPPAGE_BPS,
  useGetSwapQuote,
  useGetSwapRoutes,
  useGetTokenBalancesSummary,
  useIndexerClient
} from '@0xsequence/hooks'
import type { ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState } from 'react'
import { encodeFunctionData, formatUnits, zeroAddress, type Hex } from 'viem'
import { useAccount, usePublicClient, useReadContract, useWalletClient } from 'wagmi'

import { ERC_20_CONTRACT_ABI } from '../../constants/abi.js'
import type { Collectible } from '../../contexts/SelectPaymentModal.js'

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
  slippageBps?: number
}

export interface UseCryptoPaymentReturn {
  cryptoOptions: {
    data: CryptoOption[]
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

interface CryptoOption {
  chainId: number
  address: string
  name: string
  totalPriceRaw: string
  symbol: string
  decimals: number
  totalPriceDisplay: string
  logoUrl?: string
  isInsufficientFunds: boolean
  isSelected: boolean
}

export const useCryptoPayment = ({
  chain,
  currencyAddress,
  totalPriceRaw,
  targetContractAddress,
  txData,
  transactionConfirmations,
  onSuccess,
  onError,
  currencyInfo,
  isLoadingCurrencyInfo,
  errorCurrencyInfo,
  slippageBps
}: UseCryptoPaymentArgs): UseCryptoPaymentReturn => {
  const [selectedCurrencyAddress, setSelectedCurrencyAddress] = useState<string | undefined>(undefined)
  const { address: userAddress, connector } = useAccount()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const isNativeCurrency = compareAddress(currencyAddress, zeroAddress)
  const currencySymbol = isNativeCurrency ? network?.nativeToken.symbol : currencyInfo?.symbol
  const currencyDecimals = isNativeCurrency ? network?.nativeToken.decimals : currencyInfo?.decimals
  const isMainCurrencySelected = compareAddress(selectedCurrencyAddress || '', currencyAddress)

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

  const buyCurrencyAddress = currencyAddress

  const {
    data: swapRoutes = [],
    isLoading: swapRoutesIsLoading,
    error: swapRoutesError
  } = useGetSwapRoutes({
    walletAddress: userAddress ?? '',
    toTokenAmount: totalPriceRaw,
    toTokenAddress: currencyAddress || '',
    chainId: chainId
  })

  const { data: currencyBalanceDataPaginated, isLoading: currencyBalanceIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [currencyAddress, ...swapRoutes.flatMap(swapRoute => swapRoute.fromTokens.map(token => token.address))],
      omitNativeBalances: false
    },
    omitMetadata: true
  })

  const currencyBalanceData = currencyBalanceDataPaginated?.pages?.flatMap(page => page.balances)

  const disableSwapQuote = !selectedCurrencyAddress || compareAddress(selectedCurrencyAddress, buyCurrencyAddress)

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useGetSwapQuote(
    {
      params: {
        walletAddress: userAddress ?? '',
        toTokenAddress: currencyAddress,
        toTokenAmount: totalPriceRaw,
        fromTokenAddress: selectedCurrencyAddress || '',
        fromTokenAmount: '0',
        chainId: chainId,
        includeApprove: true,
        slippageBps: slippageBps || DEFAULT_SLIPPAGE_BPS
      }
    },
    {
      disabled: disableSwapQuote
    }
  )

  const mainCurrencyBalance =
    currencyBalanceData?.find(balance => balance.contractAddress === currencyAddress.toLowerCase())?.balance || '0'
  const priceFormatted = formatUnits(BigInt(totalPriceRaw), currencyInfo?.decimals || 0)
  const priceDisplay = formatDisplay(priceFormatted, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6
  })

  const mainCurrencyOption = !currencyBalanceIsLoading
    ? [
        {
          chainId,
          address: currencyAddress,
          name: currencyInfo?.name || 'unknown',
          totalPriceRaw: totalPriceRaw,
          decimals: currencyDecimals || 18,
          totalPriceDisplay: priceDisplay,
          logoUrl: currencyInfo?.logoURI,
          symbol: currencySymbol || '',
          isInsufficientFunds: Number(mainCurrencyBalance) < Number(totalPriceRaw),
          isSelected: compareAddress(currencyAddress, selectedCurrencyAddress || '')
        }
      ]
    : []

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

    try {
      if (isMainCurrencySelected) {
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
        const swapOption = swapRoutes
          .flatMap(route => route.fromTokens)
          .find(token => compareAddress(token.address, selectedCurrencyAddress))
        if (!swapOption) {
          throw new Error('No swap option found')
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

        const isSwapNativeToken = compareAddress(zeroAddress, swapOption.address)

        const transactions = [
          // Swap quote optional approve step
          ...(swapQuote?.approveData && !isSwapNativeToken
            ? [
                {
                  to: swapOption.address as Hex,
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

  const swapOptionsFormatted: CryptoOption[] = swapRoutes
    .flatMap(route => route.fromTokens)
    .map(fromToken => ({
      ...fromToken,
      totalPriceRaw: fromToken.price || '0',
      isSelected: compareAddress(fromToken.address, selectedCurrencyAddress || ''),
      isInsufficientFunds:
        Number(
          currencyBalanceData?.find(balance => balance.contractAddress.toLowerCase() === fromToken.address.toLowerCase())
            ?.balance || '0'
        ) < Number(fromToken.price || '0'),
      totalPriceDisplay: fromToken.price
        ? formatDisplay(formatUnits(BigInt(fromToken.price || '0'), fromToken.decimals || 18), {
            disableScientificNotation: true,
            disableCompactNotation: true,
            significantDigits: 6
          })
        : '0'
    }))

  return {
    cryptoOptions: {
      data: [...mainCurrencyOption, ...swapOptionsFormatted],
      isLoading: isLoadingCurrencyInfo || swapRoutesIsLoading || currencyBalanceIsLoading,
      error: errorCurrencyInfo || swapRoutesError
    },
    purchaseAction: {
      action: purchaseAction,
      isReady:
        !!selectedCurrencyAddress && (!isLoadingSwapQuote || isMainCurrencySelected) && (!allowanceIsLoading || isNativeCurrency),
      selectedCurrencyAddress,
      setSelectedCurrencyAddress
    }
  }
}

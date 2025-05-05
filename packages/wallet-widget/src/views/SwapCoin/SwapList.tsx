import {
  CryptoOption,
  compareAddress,
  formatDisplay,
  sendTransactions,
  useAnalyticsContext,
  ExtendedConnector,
  ContractVerificationStatus
} from '@0xsequence/connect'
import { Button, Spinner, Text } from '@0xsequence/design-system'
import {
  useGetSwapQuote,
  useClearCachedBalances,
  useGetContractInfo,
  useIndexerClient,
  useGetSwapRoutes,
  useGetTokenBalancesSummary
} from '@0xsequence/hooks'
import { useState, useMemo } from 'react'
import { zeroAddress, formatUnits, Hex } from 'viem'
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation } from '../../hooks'

interface SwapListProps {
  chainId: number
  contractAddress: string
  amount: string
  slippageBps?: number
}

export const SwapList = ({ chainId, contractAddress, amount, slippageBps }: SwapListProps) => {
  const { clearCachedBalances } = useClearCachedBalances()
  const { setNavigation } = useNavigation()
  const { address: userAddress, connector } = useAccount()
  const [isTxsPending, setIsTxsPending] = useState(false)
  const [isErrorTx, setIsErrorTx] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })
  const { switchChainAsync } = useSwitchChain()

  const isConnectorSequenceBased = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased
  const { analytics } = useAnalyticsContext()
  const connectedChainId = useChainId()
  const isCorrectChainId = connectedChainId === chainId
  const showSwitchNetwork = !isCorrectChainId && !isConnectorSequenceBased

  const buyCurrencyAddress = contractAddress
  const sellCurrencyAddress = selectedCurrency || ''

  const {
    data: swapRoutes = [],
    isLoading: swapRoutesIsLoading,
    isError: isErrorSwapRoutes
  } = useGetSwapRoutes({
    walletAddress: userAddress ?? '',
    toTokenAddress: buyCurrencyAddress,
    toTokenAmount: amount,
    chainId: chainId
  })

  const { data: currencyInfo, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: contractAddress
  })

  const disableSwapQuote = !selectedCurrency || compareAddress(selectedCurrency, buyCurrencyAddress)

  const {
    data: swapQuote,
    isLoading: isLoadingSwapQuote,
    isError: isErrorSwapQuote
  } = useGetSwapQuote(
    {
      params: {
        walletAddress: userAddress ?? '',
        toTokenAddress: buyCurrencyAddress,
        toTokenAmount: amount,
        fromTokenAddress: sellCurrencyAddress,
        chainId: chainId,
        includeApprove: true,
        slippageBps: slippageBps || 100
      }
    },
    {
      disabled: disableSwapQuote
    }
  )

  const { data: tokenBalancesData, isLoading: tokenBalancesIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: swapRoutes.flatMap(route => route.fromTokens).map(fromToken => fromToken.address.toLowerCase()),
      omitNativeBalances: false
    },
    omitMetadata: true
  })

  const tokenBalancesMap = useMemo(() => {
    const map = new Map<string, bigint>()
    tokenBalancesData?.pages?.forEach(page => {
      page.balances?.forEach(balanceData => {
        if (balanceData.contractAddress && balanceData.balance) {
          map.set(balanceData.contractAddress.toLowerCase(), BigInt(balanceData.balance))
        }
      })
    })
    return map
  }, [tokenBalancesData])

  const indexerClient = useIndexerClient(chainId)

  const quoteFetchInProgress = isLoadingSwapQuote

  const isLoading = swapRoutesIsLoading || isLoadingCurrencyInfo || tokenBalancesIsLoading

  const onClickProceed = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsErrorTx(false)
    setIsTxsPending(true)
    try {
      const swapOption = swapRoutes.flatMap(route => route.fromTokens).find(option => option.address === selectedCurrency)
      const isSwapNativeToken = compareAddress(zeroAddress, swapOption?.address || '')

      const getSwapTransactions = () => {
        if (!swapQuote || !swapOption) {
          return []
        }

        const swapTransactions = [
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
          }
        ]
        return swapTransactions
      }

      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== chainId) {
        await walletClient.switchChain({ id: chainId })
      }

      const txHash = await sendTransactions({
        connector,
        walletClient,
        publicClient,
        chainId,
        indexerClient,
        senderAddress: userAddress,
        transactions: [...getSwapTransactions()]
      })

      analytics?.track({
        event: 'SEND_TRANSACTION_REQUEST',
        props: {
          type: 'crypto',
          walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
          source: 'sequence-kit/wallet',
          chainId: String(chainId),
          origin: window.location.origin,
          txHash
        }
      })

      clearCachedBalances()

      setNavigation({
        location: 'coin-details',
        params: {
          chainId,
          contractAddress,
          accountAddress: userAddress
        }
      })
    } catch (e) {
      setIsTxsPending(false)
      setIsErrorTx(true)
      console.error('Failed to send transactions', e)
    }
  }

  const noOptionsFound = swapRoutes.flatMap(route => route.fromTokens).length === 0

  const SwapContent = () => {
    if (isLoading) {
      return (
        <div className="flex w-full justify-center items-center">
          <Spinner />
        </div>
      )
    } else if (isErrorSwapRoutes) {
      return (
        <div className="flex w-full justify-center items-center">
          <Text variant="normal" color="primary">
            A problem occurred while fetching swap options.
          </Text>
        </div>
      )
    } else if (noOptionsFound) {
      return (
        <div className="flex w-full justify-center items-center">
          <Text variant="normal" color="primary">
            No swap option found!
          </Text>
        </div>
      )
    } else {
      const buyCurrencySymbol = currencyInfo?.symbol || ''
      const buyCurrencyDecimals = currencyInfo?.decimals || 0
      const displayedAmount = formatDisplay(formatUnits(BigInt(amount), buyCurrencyDecimals), {
        disableScientificNotation: true,
        disableCompactNotation: true,
        significantDigits: 6
      })

      const getButtonLabel = () => {
        if (quoteFetchInProgress) {
          return 'Preparing swap...'
        } else if (isTxsPending) {
          return 'Processing...'
        } else {
          return 'Proceed'
        }
      }

      return (
        <div className="flex w-full gap-3 flex-col">
          <div className="flex w-full flex-col gap-2">
            <Text variant="small" color="primary">
              Select a token in your wallet to swap for {displayedAmount} {buyCurrencySymbol}.
            </Text>
            {swapRoutes
              .flatMap(route => route.fromTokens)
              .map(swapOption => {
                const sellCurrencyAddress = swapOption.address || ''
                const currentBalance = tokenBalancesMap.get(swapOption.address.toLowerCase()) ?? 0n
                const isInsufficientBalance = currentBalance < BigInt(swapOption.price || '0')

                const swapQuotePriceDisplay = formatUnits(BigInt(swapOption.price || 0), swapOption.decimals || 18)
                const formattedPrice = formatDisplay(swapQuotePriceDisplay, {
                  disableScientificNotation: true,
                  disableCompactNotation: true,
                  significantDigits: 6
                })

                return (
                  <CryptoOption
                    key={sellCurrencyAddress}
                    chainId={chainId}
                    currencyName={swapOption.name || swapOption.symbol || ''}
                    symbol={swapOption.symbol || ''}
                    isSelected={compareAddress(selectedCurrency || '', sellCurrencyAddress)}
                    iconUrl={swapOption.logoUri}
                    price={formattedPrice}
                    onClick={() => {
                      setIsErrorTx(false)
                      setSelectedCurrency(sellCurrencyAddress)
                    }}
                    disabled={isTxsPending || isInsufficientBalance}
                    showInsufficientFundsWarning={isInsufficientBalance}
                  />
                )
              })}
          </div>
          {isErrorTx && (
            <div className="w-full">
              <Text color="negative" variant="small">
                A problem occurred while executing the transaction.
              </Text>
            </div>
          )}

          {isErrorSwapQuote && (
            <div className="w-full">
              <Text color="negative" variant="small">
                A problem occurred while fetching swap quote.
              </Text>
            </div>
          )}

          {showSwitchNetwork && (
            <div className="mt-3">
              <Text className="mb-2" variant="small" color="primary">
                The wallet is connected to the wrong network. Please switch network before proceeding
              </Text>
              <Button
                className="mt-2 w-full"
                variant="primary"
                size="lg"
                type="button"
                label="Switch Network"
                onClick={async () => await switchChainAsync({ chainId })}
                disabled={isCorrectChainId}
              />
            </div>
          )}
          <Button
            className="w-full"
            type="button"
            disabled={
              noOptionsFound ||
              !selectedCurrency ||
              quoteFetchInProgress ||
              isTxsPending ||
              (!isCorrectChainId && !isConnectorSequenceBased) ||
              showSwitchNetwork
            }
            variant="primary"
            size="lg"
            label={getButtonLabel()}
            onClick={onClickProceed}
          />
        </div>
      )
    }
  }

  return (
    <div className="flex p-5 gap-2 flex-col" style={{ marginTop: HEADER_HEIGHT }}>
      <SwapContent />
    </div>
  )
}

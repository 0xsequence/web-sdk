import { Box, Button, Spinner, Text, vars } from '@0xsequence/design-system'
import {
  CryptoOption,
  compareAddress,
  formatDisplay,
  useSwapPrices,
  useSwapQuote,
  sendTransactions,
  useIndexerClient,
  useAnalyticsContext,
  ExtendedConnector,
  useClearCachedBalances,
  useCurrencyInfo
} from '@0xsequence/kit'
import { useState } from 'react'
import { zeroAddress, formatUnits, Hex } from 'viem'
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation } from '../../hooks'

interface SwapListProps {
  chainId: number
  contractAddress: string
  amount: string
}

export const SwapList = ({ chainId, contractAddress, amount }: SwapListProps) => {
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
    data: swapPrices = [],
    isLoading: swapPricesIsLoading,
    isError: isErrorSwapPrices
  } = useSwapPrices(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress,
      chainId: chainId,
      buyAmount: amount,
      withContractInfo: true
    },
    { disabled: false }
  )

  const { data: currencyInfo, isLoading: isLoadingCurrencyInfo } = useCurrencyInfo({ chainId, currencyAddress: contractAddress })

  const disableSwapQuote = !selectedCurrency || compareAddress(selectedCurrency, buyCurrencyAddress)

  const {
    data: swapQuote,
    isLoading: isLoadingSwapQuote,
    isError: isErrorSwapQuote
  } = useSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress,

      buyAmount: amount,
      chainId: chainId,
      sellCurrencyAddress,
      includeApprove: true
    },
    {
      disabled: disableSwapQuote
    }
  )

  const indexerClient = useIndexerClient(chainId)

  const quoteFetchInProgress = isLoadingSwapQuote

  const isLoading = swapPricesIsLoading || isLoadingCurrencyInfo

  const onClickProceed = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsErrorTx(false)
    setIsTxsPending(true)
    try {
      const swapPrice = swapPrices?.find(price => price.info?.address === selectedCurrency)
      const isSwapNativeToken = compareAddress(zeroAddress, swapPrice?.price.currencyAddress || '')

      const getSwapTransactions = () => {
        if (!swapQuote || !swapPrice) {
          return []
        }

        const swapTransactions = [
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
          contractAddress
        }
      })
    } catch (e) {
      setIsTxsPending(false)
      setIsErrorTx(true)
      console.error('Failed to send transactions', e)
    }
  }

  const noOptionsFound = swapPrices.length === 0

  const SwapContent = () => {
    if (isLoading) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Spinner />
        </Box>
      )
    } else if (isErrorSwapPrices) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Text variant="normal" color="negative">
            A problem occurred while fetching swap options.
          </Text>
        </Box>
      )
    } else if (noOptionsFound) {
      return (
        <Box width="full" justifyContent="center" alignItems="center">
          <Text variant="normal" color="text100">
            No swap option found!
          </Text>
        </Box>
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
        <Box width="full" gap="3" flexDirection="column">
          <Box width="full" flexDirection="column" gap="2">
            <Text variant="small" color="text100">
              Select a token in your wallet to swap for {displayedAmount} {buyCurrencySymbol}.
            </Text>
            {swapPrices.map(swapPrice => {
              const sellCurrencyAddress = swapPrice.info?.address || ''

              const formattedPrice = formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 0)
              const displayPrice = formatDisplay(formattedPrice, {
                disableScientificNotation: true,
                disableCompactNotation: true,
                significantDigits: 6
              })
              return (
                <CryptoOption
                  key={sellCurrencyAddress}
                  chainId={chainId}
                  currencyName={swapPrice.info?.name || swapPrice.info?.symbol || ''}
                  symbol={swapPrice.info?.symbol || ''}
                  isSelected={compareAddress(selectedCurrency || '', sellCurrencyAddress)}
                  iconUrl={swapPrice.info?.logoURI}
                  price={displayPrice}
                  onClick={() => {
                    setIsErrorTx(false)
                    setSelectedCurrency(sellCurrencyAddress)
                  }}
                  disabled={isTxsPending}
                />
              )
            })}
          </Box>
          {isErrorTx && (
            <Box width="full">
              <Text color="negative" variant="small">
                A problem occurred while executing the transaction.
              </Text>
            </Box>
          )}

          {isErrorSwapQuote && (
            <Box width="full">
              <Text color="negative" variant="small">
                A problem occurred while fetching swap quote.
              </Text>
            </Box>
          )}

          {showSwitchNetwork && (
            <Box marginTop="3">
              <Text variant="small" color="negative" marginBottom="2">
                The wallet is connected to the wrong network. Please switch network before proceeding
              </Text>
              <Button
                marginTop="2"
                width="full"
                variant="primary"
                type="button"
                label="Switch Network"
                onClick={async () => await switchChainAsync({ chainId })}
                disabled={isCorrectChainId}
                style={{ height: '52px', borderRadius: vars.radii.md }}
              />
            </Box>
          )}

          <Button
            width="full"
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
            label={getButtonLabel()}
            onClick={onClickProceed}
            style={{ height: '52px', borderRadius: vars.radii.md }}
          />
        </Box>
      )
    }
  }

  return (
    <Box padding="5" gap="2" flexDirection="column" style={{ marginTop: HEADER_HEIGHT }}>
      <SwapContent />
    </Box>
  )
}

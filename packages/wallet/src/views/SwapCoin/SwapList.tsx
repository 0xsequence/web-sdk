import { Box, Button, Spinner, Text } from '@0xsequence/design-system'
import {
  CryptoOption,
  compareAddress,
  formatDisplay,
  useContractInfo,
  useSwapPrices,
  useSwapQuote,
  sendTransactions,
  useIndexerClient
} from '@0xsequence/kit'

import { useState } from 'react'
import { zeroAddress, formatUnits, Hex } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'

interface SwapListProps {
  chainId: number
  contractAddress: string
  amount: string
}

export const SwapList = ({ chainId, contractAddress, amount }: SwapListProps) => {
  const { address: userAddress, connector } = useAccount()
  const [isTxsPending, setIsTxsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })

  const buyCurrencyAddress = contractAddress
  const sellCurrencyAddress = selectedCurrency || ''

  const { data: swapPrices = [], isLoading: swapPricesIsLoading } = useSwapPrices(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress,
      chainId: chainId,
      buyAmount: amount,
      withContractInfo: true
    },
    { disabled: false }
  )

  const disableSwapQuote = !selectedCurrency || compareAddress(selectedCurrency, buyCurrencyAddress)

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: contractAddress,
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

  const isMainCurrencySelected = compareAddress(selectedCurrency || '', contractAddress)
  const quoteFetchInProgress = isLoadingSwapQuote && !isMainCurrencySelected

  const isLoading = swapPricesIsLoading

  const onClickProceed = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsError(false)
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
        transactions: [...getSwapTransactions()],
        waitConfirmationForLastTransaction: false
      })

      // TODO: post swap TXs dump cache

      // closeSwapModal()
      // openTransactionStatusModal({
      //   chainId,
      //   txHash,
      //   onSuccess: () => {
      //     onSuccess(txHash)
      //   }
      // })
    } catch (e) {
      setIsTxsPending(false)
      setIsError(true)
      console.error('Failed to send transactions', e)
    }
  }

  const noOptionsFound = swapPrices.length === 0

  const SwapContent = () => {
    if (isLoading) {
      return (
        <Box marginTop="3" width="full" justifyContent="center" alignItems="center">
          <Spinner />
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
      return (
        <Box width="full" gap="3" flexDirection="column">
          <Box width="full" flexDirection="column" gap="2">
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
                    setIsError(false)
                    setSelectedCurrency(sellCurrencyAddress)
                  }}
                  disabled={isTxsPending}
                />
              )
            })}
          </Box>
          {isError && (
            <Box width="full">
              <Text color="negative" variant="small">
                A problem occurred while executing the transaction.
              </Text>
            </Box>
          )}
          <Button
            width="full"
            disabled={noOptionsFound || !selectedCurrency || quoteFetchInProgress || isTxsPending}
            variant="primary"
            label={quoteFetchInProgress ? 'Preparing swap...' : 'Proceed'}
            onClick={onClickProceed}
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
// // Check fee options before showing confirmation
// const feeOptionsResult = await checkFeeOptions({
//   transactions: [transaction],
//   chainId
// })

// setFeeOptions(
//   feeOptionsResult?.feeOptions
//     ? {
//         options: feeOptionsResult.feeOptions,
//         chainId
//       }
//     : undefined
// )

// setShowConfirmation(true)

// setIsCheckingFeeOptions(false)

// {showConfirmation && (
//   <TransactionConfirmation
//     name={name}
//     symbol={symbol}
//     imageUrl={imageUrl}
//     amount={amountToSendFormatted}
//     toAddress={toAddress}
//     chainId={chainId}
//     balance={tokenBalance?.balance || '0'}
//     decimals={decimals}
//     fiatValue={amountToSendFiat}
//     feeOptions={feeOptions}
//     onSelectFeeOption={feeTokenAddress => {
//       setSelectedFeeTokenAddress(feeTokenAddress)
//     }}
//     isLoading={isSendTxnPending}
//     onConfirm={() => {
//       executeTransaction()
//     }}
//     onCancel={() => {
//       setShowConfirmation(false)
//     }}
//   />
// )}

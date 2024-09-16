import { useState, useEffect } from 'react'
import {
  useSwapQuotes,
  SwapQuotesWithCurrencyInfo,
  compareAddress,
  sendTransactions,
  TRANSACTION_CONFIRMATIONS_DEFAULT
} from '@0xsequence/kit'
import { Box, Button, Card, Spinner, Text, TokenImage, useMediaQuery } from '@0xsequence/design-system'
import { formatUnits, Hex, encodeFunctionData } from 'viem'
import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi'

import { ERC_20_CONTRACT_ABI } from '../../../constants/abi'
import { PayWithCryptoSettings } from '../../../contexts'
import { useClearCachedBalances, useSelectPaymentModal } from '../../../hooks'

interface SwapAndPayProps {
  settings: PayWithCryptoSettings
}

export const SwapAndPay = ({
  settings
}: SwapAndPayProps) => {
  const {
    chainId,
    currencyAddress,
    targetContractAddress,
    currencyRawAmount,
    txData,
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onSuccess = () => {},
    onError = () => {},
  } = settings

  const isMobile = useMediaQuery('isMobile')
  const { address: userAddress, connector } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [swapsInProgress, setSwapsInProgress] = useState<string[]>([])
  const { closeSelectPaymentModal } = useSelectPaymentModal()

  const {
    data: allowanceData,
    isLoading: allowanceIsLoading,
    refetch: refechAllowance
  } = useReadContract({
    abi: ERC_20_CONTRACT_ABI,
    functionName: 'allowance',
    chainId: chainId,
    address: targetContractAddress as Hex,
    args: [userAddress, targetContractAddress],
    query: {
      enabled: !!userAddress
    }
  })

  const price = BigInt(currencyRawAmount) || 0n
  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price)

  const { data: swapQuotes, isLoading: swapQuotesIsLoading } = useSwapQuotes({
    userAddress: userAddress ?? '',
    currencyAddress: settings?.currencyAddress,
    chainId: chainId,
    currencyAmount: currencyRawAmount,
    withContractInfo: true
  })

  interface StatusMessageProps {
    purchaseInProgress: boolean
  }

  const StatusMessage = ({ purchaseInProgress }: StatusMessageProps) => {
    if (purchaseInProgress) {
      return (
        <Box flexDirection="row" gap="1" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
          <Text variant="small" color="text100">
            In progress...
          </Text>
          <Box justifyContent="center" alignItems="center" style={{ height: '22px', width: '22px' }}>
            <Spinner size="sm" />
          </Box>
        </Box>
      )
    }

    return null
  }

  useEffect(() => {
    clearCachedBalances()
    setSwapsInProgress([])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading: boolean = swapQuotesIsLoading || allowanceIsLoading

  if (isLoading) {
    return (
      <Card
        width="full"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          minHeight: '200px'
        }}
      >
        <Spinner />
      </Card>
    )
  }

  const onClickPurchase = async (swapQuote: SwapQuotesWithCurrencyInfo) => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector) {
      return
    }

    const swapQuoteAddress = swapQuote.info?.address || ''

    setSwapsInProgress([...swapsInProgress.filter(address => compareAddress(address, swapQuoteAddress)), swapQuoteAddress])

    try {
      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== chainId) {
        await walletClient.switchChain({ id: chainId })
      }

      const approveTxData = encodeFunctionData({
        abi: ERC_20_CONTRACT_ABI,
        functionName: 'approve',
        args: [targetContractAddress, price]
      })

      const transactions = [
        // Swap quote optional approve step
        ...(swapQuote.quote.approveData
          ? [
              {
                to: swapQuote.quote.currencyAddress as Hex,
                data: swapQuote.quote.approveData as Hex,
                chain: chainId
              }
            ]
          : []),
        // Swap quote tx
        {
          to: swapQuote.quote.to as Hex,
          data: swapQuote.quote.transactionData as Hex,
          chain: chainId
        },
        // Actual transaction optional approve step
        ...(isApproved
          ? []
          : [
              {
                to: currencyAddress as  Hex,
                data: approveTxData as Hex,
                chainId: chainId
              }
          ]
        ),
        // transaction on the contract
        {
          to: targetContractAddress  as  Hex,
          data: txData as Hex,
          chainId
        }
      ]

      await sendTransactions({
        chainId,
        senderAddress: userAddress,
        publicClient,
        walletClient,
        connector,
        transactions,
        transactionConfirmations,
      })

      closeSelectPaymentModal()
      refechAllowance()
      clearCachedBalances()
      onSuccess()
    } catch (e) {
      console.error('Failed to purchase...', e)
      onError(e as Error)
    }

    setSwapsInProgress([...swapsInProgress.filter(address => compareAddress(address, swapQuoteAddress))])
  }

  return swapQuotes?.map((swapQuote, index) => {
    const swapQuotePriceFormatted = formatUnits(BigInt(swapQuote.quote.price), swapQuote.info?.decimals || 18)
    const balanceFormatted = formatUnits(BigInt(swapQuote.balance?.balance || 0), swapQuote.info?.decimals || 18)
    const swapQuoteAddress = swapQuote.info?.address || ''
    const purchaseInProgress = swapsInProgress.includes(swapQuoteAddress)

    return (
      <Card
        key={swapQuote.info?.address || index}
        width="full"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems="center"
        justifyContent="space-between"
        gap={isMobile ? '2' : '0'}
        style={{
          minHeight: '200px'
        }}
      >
        <Box
          flexDirection="column"
          gap="2"
          justifyContent={isMobile ? 'center' : 'flex-start'}
          style={{ ...(isMobile ? { width: '200px' } : {}) }}
        >
          <Box justifyContent={isMobile ? 'center' : 'flex-start'}>
            <Text color="text100">Buy With {swapQuote.info?.name || 'Unknown'}</Text>
          </Box>
          <Box flexDirection="row" gap="1" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
            <Text variant="small" color="text100">
              {`Price: ${swapQuotePriceFormatted} ${swapQuote.info?.symbol}`}
            </Text>
            <TokenImage size="xs" src={swapQuote.info?.logoURI} />
          </Box>
          <Box flexDirection="row" gap="1" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
            <Text variant="small" color="text100">
              {`Balance: ${balanceFormatted} ${swapQuote.info?.symbol}`}
            </Text>
            <TokenImage size="xs" src={swapQuote.info?.logoURI} />
          </Box>
          <StatusMessage purchaseInProgress={purchaseInProgress} />
        </Box>
        <Box
          flexDirection="column"
          gap="2"
          alignItems={isMobile ? 'center' : 'flex-start'}
          style={{ ...(isMobile ? { width: '200px' } : {}) }}
        >
          <Button
            label="Purchase"
            onClick={() => onClickPurchase(swapQuote)}
            disabled={purchaseInProgress}
            variant="primary"
            shape="square"
            pending={purchaseInProgress}
          />
        </Box>
      </Card>
    )
  })
}
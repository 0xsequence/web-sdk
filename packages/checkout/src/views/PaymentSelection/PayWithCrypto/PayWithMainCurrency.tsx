import { useState } from 'react'
import {
  useBalances,
  useContractInfo,
  compareAddress,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  sendTransactions
} from '@0xsequence/kit'
import type { SequenceWaaS } from '@0xsequence/waas'
import { Box, Button, Card, Spinner, Text, TokenImage, useMediaQuery } from '@0xsequence/design-system'

import { encodeFunctionData, formatUnits, Hex } from 'viem'
import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi'

import { PayWithCryptoSettings } from '../../../contexts'
import { CARD_HEIGHT } from '../../../constants'
import { ERC_20_CONTRACT_ABI } from '../../../constants/abi'
import { useClearCachedBalances, useSelectPaymentModal } from '../../../hooks'

interface PayWithMainCurrencyProps {
  settings: PayWithCryptoSettings
}

export const PayWithMainCurrency = ({
  settings
}: PayWithMainCurrencyProps) => {
  const {
    chainId,
    currencyAddress,
    targetContractAddress,
    currencyRawAmount,
    txData,
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT
  } = settings
  const { address: userAddress, connector } = useAccount()
  const isMobile = useMediaQuery('isMobile')
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [purchaseInProgress, setPurchaseInProgress] = useState(false)
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()

  const {
    data: allowanceData,
    isLoading: allowanceIsLoading,
    refetch: refechAllowance
  } = useReadContract({
    abi: ERC_20_CONTRACT_ABI,
    functionName: 'allowance',
    chainId: chainId,
    address: currencyAddress as Hex,
    args: [userAddress, targetContractAddress],
    query: {
      enabled: !!userAddress
    }
  })

  const { data: currencyBalanceData, isLoading: currencyBalanceIsLoading } = useBalances({
    chainIds: [chainId],
    contractAddress: currencyAddress,
    accountAddress: userAddress || '',
    // includeMetadata must be false to work around a bug
    includeMetadata: false
  })

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useContractInfo(
    chainId,
    currencyAddress
  )

  const isLoading = allowanceIsLoading || currencyBalanceIsLoading ||isLoadingCurrencyInfo

  if (isLoading) {
    return (
      <Card
        width="full"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          minHeight: CARD_HEIGHT
        }}
      >
        <Spinner />
      </Card>
    )
  }

  const priceFormatted = formatUnits(BigInt(currencyRawAmount), currencyInfoData?.decimals || 0)
  const isApproved: boolean = (allowanceData as bigint) >= BigInt(currencyRawAmount)

  const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))

  const balance: bigint = BigInt(balanceInfo?.balance || '0')
  let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

  const isNotEnoughFunds: boolean = BigInt(currencyRawAmount) > balance

  const onClickPurchase = async () => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector) {
      return
    }

    setPurchaseInProgress(true)

    try {
      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== chainId) {
        await walletClient.switchChain({ id: chainId })
      }

      const approveTxData = encodeFunctionData({
        abi: ERC_20_CONTRACT_ABI,
        functionName: 'approve',
        args: [targetContractAddress, currencyRawAmount]
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
      })

      closeSelectPaymentModal()
      refechAllowance()
      clearCachedBalances()
    } catch (e) {
      console.error('Failed to purchase...', e)
    }

    setPurchaseInProgress(false)
  }


  const StatusMessage = () => {
    if (isNotEnoughFunds) {
      return (
        <Box flexDirection="row" gap="1" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
          <Text variant="small" color="negative">
            Not enough funds
          </Text>
          <Box style={{ height: '22px', width: '22px' }} />
        </Box>
      )
    }

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

  return (
    <Card
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
          <Text color="text100">Buy With {currencyInfoData?.name}</Text>
        </Box>
        <Box flexDirection="row" gap="1" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
          <Text variant="small" color="text100">
            {`Price: ${priceFormatted} ${currencyInfoData?.symbol}`}
          </Text>
          <TokenImage size="xs" src={currencyInfoData?.logoURI} />
        </Box>
        <Box flexDirection="row" gap="1" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
          <Text variant="small" color="text100">
            {`Balance: ${balanceFormatted} ${currencyInfoData?.symbol}`}
          </Text>
          <TokenImage size="xs" src={currencyInfoData?.logoURI} />
        </Box>
        <StatusMessage />
      </Box>
      <Box
        flexDirection="column"
        gap="2"
        alignItems={isMobile ? 'center' : 'flex-start'}
        style={{ ...(isMobile ? { width: '200px' } : {}) }}
      >
        <Button
          label="Purchase"
          onClick={onClickPurchase}
          disabled={purchaseInProgress || isNotEnoughFunds}
          variant="primary"
          shape="square"
          pending={purchaseInProgress}
        />
      </Box>
    </Card>
  )
}
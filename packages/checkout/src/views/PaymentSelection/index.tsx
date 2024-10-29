import { Box, Button, Divider, Text } from '@0xsequence/design-system'
import {
  useBalances,
  useContractInfo,
  useSwapPrices,
  useSwapQuote,
  compareAddress,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  sendTransactions,
  SwapPricesWithCurrencyInfo,
  NATIVE_TOKEN_ADDRESS_0X
} from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState, useEffect } from 'react'
import { encodeFunctionData, formatUnits, Hex, zeroAddress } from 'viem'

import { Footer } from './Footer'
import { OrderSummary } from './OrderSummary'
import { PayWithCreditCard } from './PayWithCreditCard'
import { PayWithCrypto } from './PayWithCrypto/index'
import { TransferFunds } from './TransferFunds'

import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'
import { NavigationHeader } from '../../shared/components/NavigationHeader'
import { ERC_20_CONTRACT_ABI } from '../../constants/abi'
import { useClearCachedBalances, useSelectPaymentModal } from '../../hooks'

export const PaymentSelection = () => {
  return (
    <>
      <PaymentSelectionHeader />
      <PaymentSelectionContent />
    </>
  )
}

export const PaymentSelectionHeader = () => {
  return <NavigationHeader primaryText="Checkout" />
}

export const PaymentSelectionContent = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()

  const [disableButtons, setDisableButtons] = useState(false)
  const [isError, setIsError] = useState<boolean>(false)

  if (!selectPaymentSettings) {
    return null
  }
  const {
    chain,
    currencyAddress,
    targetContractAddress,
    price,
    txData,
    enableTransferFunds = true,
    enableMainCurrencyPayment = true,
    enableSwapPayments = true,
    creditCardProviders = [],
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onSuccess = () => {},
    onError = () => {}
  } = selectPaymentSettings

  const isNativeToken = compareAddress(currencyAddress, zeroAddress)

  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const { address: userAddress, connector } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({
    chainId
  })
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

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useContractInfo(chainId, currencyAddress)

  const buyCurrencyAddress = compareAddress(currencyAddress, zeroAddress) ? NATIVE_TOKEN_ADDRESS_0X : currencyAddress

  const { data: swapPrices = [], isLoading: swapPricesIsLoading } = useSwapPrices(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress,
      chainId: chainId,
      buyAmount: price,
      withContractInfo: true
    },
    { disabled: !enableSwapPayments }
  )

  const disableSwapQuote = !selectedCurrency || compareAddress(currencyAddress, selectedCurrency || '')

  const swapQuotesSellCurrency = compareAddress(currencyAddress || '', zeroAddress)
    ? NATIVE_TOKEN_ADDRESS_0X
    : selectedCurrency || ''

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: currencyAddress,
      buyAmount: price,
      chainId: chainId,
      sellCurrencyAddress: swapQuotesSellCurrency,
      includeApprove: true
    },
    {
      disabled: !selectedCurrency
    }
  )

  const isLoading = allowanceIsLoading || currencyBalanceIsLoading || isLoadingCurrencyInfo

  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price) || isNativeToken

  const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))

  const balance: bigint = BigInt(balanceInfo?.balance || '0')
  let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

  useEffect(() => {
    clearCachedBalances()
  }, [])

  const onPurchaseMainCurrency = async () => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector) {
      return
    }

    setIsError(false)
    setDisableButtons(true)

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
          ...(isNativeToken
            ? {
                value: BigInt(price)
              }
            : {})
        }
      ]

      const txHash = await sendTransactions({
        chainId,
        senderAddress: userAddress,
        publicClient,
        walletClient,
        connector,
        transactions,
        transactionConfirmations
      })

      closeSelectPaymentModal()
      refechAllowance()
      clearCachedBalances()
      onSuccess(txHash)
    } catch (e) {
      console.error('Failed to purchase...', e)
      onError(e as Error)
      setIsError(true)
    }

    setDisableButtons(false)
  }

  const onClickPurchaseSwap = async (swapPrice: SwapPricesWithCurrencyInfo) => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector || !swapQuote) {
      return
    }

    setIsError(false)
    setDisableButtons(true)

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

      const isSwapNativeToken = compareAddress(NATIVE_TOKEN_ADDRESS_0X, swapPrice.price.currencyAddress)

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
        ...(isApproved || isNativeToken
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
          ...(isNativeToken
            ? {
                value: BigInt(price)
              }
            : {})
        }
      ]

      const txHash = await sendTransactions({
        chainId,
        senderAddress: userAddress,
        publicClient,
        walletClient,
        connector,
        transactions,
        transactionConfirmations
      })

      closeSelectPaymentModal()
      refechAllowance()
      clearCachedBalances()
      onSuccess(txHash)
    } catch (e) {
      console.error('Failed to purchase...', e)
      onError(e as Error)
      setIsError(true)
    }

    setDisableButtons(false)
  }

  const onClickPurchase = () => {
    if (compareAddress(selectedCurrency || '', currencyAddress)) {
      onPurchaseMainCurrency()
    } else {
      const foundSwap = swapPrices?.find(price => price.info?.address === selectedCurrency)
      if (foundSwap) {
        onClickPurchaseSwap(foundSwap)
      }
    }
  }

  return (
    <>
      <Box
        flexDirection="column"
        gap="2"
        alignItems="flex-start"
        width="full"
        paddingBottom="0"
        paddingX="6"
        height="full"
        style={{
          paddingTop: HEADER_HEIGHT
        }}
      >
        <Box flexDirection="column" width="full" gap="2">
          <OrderSummary />
        </Box>
        {(enableMainCurrencyPayment || enableSwapPayments) && (
          <>
            <Divider width="full" marginY="3" />
            <PayWithCrypto
              settings={selectPaymentSettings}
              disableButtons={disableButtons}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              isLoading={isLoading}
            />
          </>
        )}
        {creditCardProviders?.length > 0 && (
          <>
            <Divider width="full" marginY="3" />
            <PayWithCreditCard settings={selectPaymentSettings} disableButtons={disableButtons} />
          </>
        )}
        {enableTransferFunds && (
          <>
            <Divider width="full" marginY="3" />
            <TransferFunds />
          </>
        )}
        {(enableMainCurrencyPayment || enableSwapPayments) && (
          <>
            {isError && (
              <Box width="full" style={{ marginBottom: '-18px' }}>
                <Text color="negative" variant="small">
                  A problem occurred while executing the transaction.
                </Text>
              </Box>
            )}
            <Box width="full">
              <Button
                onClick={onClickPurchase}
                disabled={isLoading || disableButtons || !selectedCurrency || (!disableSwapQuote && isLoadingSwapQuote)}
                marginTop="6"
                shape="square"
                variant="primary"
                width="full"
                label="Complete Purchase"
              />
              <Box width="full" justifyContent="center" alignItems="center" gap="0.5" marginY="2">
                {/* Replace by icon from design-system once new release is out */}
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.82807 5.24497V3.52873C8.82807 2.24258 7.78549 1.19995 6.49934 1.19995C5.21319 1.19995 4.17057 2.24258 4.17057 3.52873L4.17057 5.24497H3.9832C3.32046 5.24497 2.7832 5.78223 2.7832 6.44497V9.49529C2.7832 10.158 3.32046 10.6953 3.9832 10.6953H9.01546C9.6782 10.6953 10.2155 10.158 10.2155 9.49529V6.44497C10.2155 5.78223 9.6782 5.24497 9.01546 5.24497H8.82807ZM6.49934 2.06705C5.69209 2.06705 5.03769 2.72144 5.03766 3.52867L5.03767 5.24497H7.96097V3.52867C7.96094 2.72144 7.30658 2.06705 6.49934 2.06705Z"
                    fill="#6D6D6D"
                  />
                </svg>
                <Text variant="xsmall" color="text50" marginTop="0.5">
                  Secure Checkout
                </Text>
              </Box>
            </Box>
          </>
        )}
      </Box>
      <Divider marginY="0" />
      <Footer />
    </>
  )
}

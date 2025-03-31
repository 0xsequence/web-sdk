import {
  useAnalyticsContext,
  compareAddress,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  sendTransactions,
  ContractVerificationStatus
} from '@0xsequence/connect'
import { Button, Divider, Text, Spinner } from '@0xsequence/design-system'
import {
  useClearCachedBalances,
  useGetTokenBalancesSummary,
  useGetContractInfo,
  SwapPricesWithCurrencyInfo,
  useGetSwapPrices,
  useGetSwapQuote,
  useIndexerClient
} from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState, useEffect } from 'react'
import { encodeFunctionData, Hex, zeroAddress } from 'viem'
import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi'

import { NavigationHeader } from '../../components/NavigationHeader'
import { HEADER_HEIGHT, NFT_CHECKOUT_SOURCE } from '../../constants'
import { ERC_20_CONTRACT_ABI } from '../../constants/abi'
import { SelectPaymentSettings } from '../../contexts/SelectPaymentModal'
import { useSelectPaymentModal, useTransactionStatusModal, useSkipOnCloseCallback } from '../../hooks'

import { Footer } from './Footer'
import { FundWithFiat } from './FundWithFiat'
import { OrderSummary } from './OrderSummary'
import { PayWithCreditCard } from './PayWithCreditCard'
import { PayWithCrypto } from './PayWithCrypto/index'
import { TransferFunds } from './TransferFunds'

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
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const { selectPaymentSettings = {} as SelectPaymentSettings } = useSelectPaymentModal()
  const { analytics } = useAnalyticsContext()

  const [disableButtons, setDisableButtons] = useState(false)
  const [isError, setIsError] = useState<boolean>(false)

  const {
    chain,
    collectibles,
    collectionAddress,
    currencyAddress,
    targetContractAddress,
    approvedSpenderAddress,
    price,
    txData,
    enableTransferFunds = true,
    enableMainCurrencyPayment = true,
    enableSwapPayments = true,
    creditCardProviders = [],
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onRampProvider,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    supplementaryAnalyticsInfo,
    skipNativeBalanceCheck
  } = selectPaymentSettings

  const isNativeToken = compareAddress(currencyAddress, zeroAddress)

  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137
  const { address: userAddress, connector } = useAccount()
  const { data: walletClient } = useWalletClient({
    chainId
  })
  const publicClient = usePublicClient({
    chainId
  })
  const indexerClient = useIndexerClient(chainId)
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const { skipOnCloseCallback } = useSkipOnCloseCallback(onClose)

  const { data: allowanceData, isLoading: allowanceIsLoading } = useReadContract({
    abi: ERC_20_CONTRACT_ABI,
    functionName: 'allowance',
    chainId: chainId,
    address: currencyAddress as Hex,
    args: [userAddress, approvedSpenderAddress || targetContractAddress],
    query: {
      enabled: !!userAddress && !isNativeToken
    }
  })

  const { data: _currencyBalanceData, isLoading: currencyBalanceIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [currencyAddress],
      omitNativeBalances: skipNativeBalanceCheck ?? false
    },
    // omitMetadata must be true to avoid a bug
    omitMetadata: true
  })

  const { data: _currencyInfoData, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: currencyAddress
  })

  const buyCurrencyAddress = currencyAddress
  const sellCurrencyAddress = selectedCurrency || ''

  const { data: swapPrices = [], isLoading: _swapPricesIsLoading } = useGetSwapPrices(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress,
      chainId: chainId,
      buyAmount: price,
      withContractInfo: true
    },
    { disabled: !enableSwapPayments }
  )

  const disableSwapQuote = !selectedCurrency || compareAddress(selectedCurrency, buyCurrencyAddress)

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useGetSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: currencyAddress,
      buyAmount: price,
      chainId: chainId,
      sellCurrencyAddress,
      includeApprove: true
    },
    {
      disabled: disableSwapQuote
    }
  )

  const isLoading = (allowanceIsLoading && !isNativeToken) || currencyBalanceIsLoading || isLoadingCurrencyInfo

  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price) || isNativeToken

  // const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))
  // const balance: bigint = BigInt(balanceInfo?.balance || '0')
  // let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  // balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

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
        args: [approvedSpenderAddress || targetContractAddress, price]
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
        indexerClient,
        connector,
        transactions,
        transactionConfirmations,
        waitConfirmationForLastTransaction: false
      })

      analytics?.track({
        event: 'SEND_TRANSACTION_REQUEST',
        props: {
          ...supplementaryAnalyticsInfo,
          type: 'crypto',
          source: NFT_CHECKOUT_SOURCE,
          chainId: String(chainId),
          listedCurrency: currencyAddress,
          purchasedCurrency: currencyAddress,
          origin: window.location.origin,
          from: userAddress,
          to: targetContractAddress,
          item_ids: JSON.stringify(collectibles.map(c => c.tokenId)),
          item_quantities: JSON.stringify(collectibles.map(c => c.quantity)),
          txHash
        }
      })

      closeSelectPaymentModal()

      skipOnCloseCallback()

      openTransactionStatusModal({
        chainId,
        currencyAddress,
        collectionAddress,
        txHash,
        items: collectibles.map(collectible => ({
          tokenId: collectible.tokenId,
          quantity: collectible.quantity,
          decimals: collectible.decimals,
          price: collectible.price || price
        })),
        onSuccess: () => {
          clearCachedBalances()
          onSuccess(txHash)
        },
        onClose
      })
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
        args: [approvedSpenderAddress || targetContractAddress, price]
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
        indexerClient,
        connector,
        transactions,
        transactionConfirmations,
        waitConfirmationForLastTransaction: false
      })

      analytics?.track({
        event: 'SEND_TRANSACTION_REQUEST',
        props: {
          ...supplementaryAnalyticsInfo,
          type: 'crypto',
          source: NFT_CHECKOUT_SOURCE,
          chainId: String(chainId),
          listedCurrency: swapPrice.price.currencyAddress,
          purchasedCurrency: currencyAddress,
          origin: window.location.origin,
          from: userAddress,
          to: targetContractAddress,
          item_ids: JSON.stringify(collectibles.map(c => c.tokenId)),
          item_quantities: JSON.stringify(collectibles.map(c => c.quantity)),
          txHash
        }
      })

      closeSelectPaymentModal()

      skipOnCloseCallback()

      openTransactionStatusModal({
        chainId,
        currencyAddress,
        collectionAddress,
        txHash,
        items: collectibles.map(collectible => ({
          tokenId: collectible.tokenId,
          quantity: collectible.quantity,
          decimals: collectible.decimals,
          price: collectible.price || price
        })),
        onSuccess: () => {
          clearCachedBalances()
          onSuccess(txHash)
        },
        onClose
      })
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

  const cryptoSymbol = isNativeToken ? network?.nativeToken.symbol : _currencyInfoData?.symbol

  return (
    <>
      <div
        className="flex flex-col gap-2 items-start w-full pb-0 px-6 h-full"
        style={{
          paddingTop: HEADER_HEIGHT
        }}
      >
        <div className="flex flex-col w-full gap-2">
          <OrderSummary />
        </div>
        {(enableMainCurrencyPayment || enableSwapPayments) && (
          <>
            <Divider className="w-full my-3" />
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
            <Divider className="w-full my-3" />
            <PayWithCreditCard
              settings={selectPaymentSettings}
              disableButtons={disableButtons}
              skipOnCloseCallback={skipOnCloseCallback}
            />
          </>
        )}
        {onRampProvider && (
          <>
            <Divider className="w-full my-3" />
            {isLoadingCurrencyInfo && !isNativeToken ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner />
              </div>
            ) : (
              <FundWithFiat
                cryptoSymbol={cryptoSymbol}
                walletAddress={userAddress || ''}
                provider={onRampProvider}
                chainId={chainId}
              />
            )}
          </>
        )}
        {enableTransferFunds && (
          <>
            <Divider className="w-full my-3" />
            <TransferFunds />
          </>
        )}
        {(enableMainCurrencyPayment || enableSwapPayments) && (
          <>
            {isError && (
              <div className="w-full" style={{ marginBottom: '-18px' }}>
                <Text color="negative" variant="small">
                  A problem occurred while executing the transaction.
                </Text>
              </div>
            )}
            <div className="w-full">
              <Button
                className="mt-6 w-full"
                onClick={onClickPurchase}
                disabled={isLoading || disableButtons || !selectedCurrency || (!disableSwapQuote && isLoadingSwapQuote)}
                shape="square"
                variant="primary"
                label="Complete Purchase"
              />
              <div className="flex w-full justify-center items-center gap-0.5 my-2">
                {/* Replace by icon from design-system once new release is out */}
                <svg width="13" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 12" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.82807 5.24497V3.52873C8.82807 2.24258 7.78549 1.19995 6.49934 1.19995C5.21319 1.19995 4.17057 2.24258 4.17057 3.52873L4.17057 5.24497H3.9832C3.32046 5.24497 2.7832 5.78223 2.7832 6.44497V9.49529C2.7832 10.158 3.32046 10.6953 3.9832 10.6953H9.01546C9.6782 10.6953 10.2155 10.158 10.2155 9.49529V6.44497C10.2155 5.78223 9.6782 5.24497 9.01546 5.24497H8.82807ZM6.49934 2.06705C5.69209 2.06705 5.03769 2.72144 5.03766 3.52867L5.03767 5.24497H7.96097V3.52867C7.96094 2.72144 7.30658 2.06705 6.49934 2.06705Z"
                    fill="#6D6D6D"
                  />
                </svg>
                <Text className="mt-0.5" variant="xsmall" color="muted">
                  Secure Checkout
                </Text>
              </div>
            </div>
          </>
        )}
      </div>
      <Divider className="my-0" />
      <Footer />
    </>
  )
}

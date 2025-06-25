import type { LifiSwapRoute, LifiToken } from '@0xsequence/api'
import {
  compareAddress,
  ContractVerificationStatus,
  CryptoOption,
  formatDisplay,
  sendTransactions,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  useAnalyticsContext
} from '@0xsequence/connect'
import { AddIcon, Button, ChevronDownIcon, Spinner, SubtractIcon, Text, TokenImage, WarningIcon } from '@0xsequence/design-system'
import {
  useClearCachedBalances,
  useGetCoinPrices,
  useGetContractInfo,
  useGetTokenBalancesSummary,
  useIndexerClient,
  useGetSwapRoutes,
  useGetSwapQuote
} from '@0xsequence/hooks'
import { TransactionOnRampProvider } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'
import { motion } from 'motion/react'
import { Fragment, useEffect, useMemo, useState, type SetStateAction } from 'react'
import { encodeFunctionData, formatUnits, zeroAddress, type Hex } from 'viem'
import { useAccount, useWalletClient, usePublicClient, useReadContract } from 'wagmi'

import { useAddFundsModal } from '../../../../hooks/index.js'

import { EVENT_SOURCE } from '../../../../constants/index.js'
import { ERC_20_CONTRACT_ABI } from '../../../../constants/abi.js'
import type { SelectPaymentSettings } from '../../../../contexts/SelectPaymentModal.js'
import { useSelectPaymentModal, useTransactionStatusModal, useSkipOnCloseCallback } from '../../../../hooks/index.js'
import { useNavigationCheckout } from '../../../../hooks/useNavigationCheckout.js'

interface PayWithCryptoProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  selectedCurrency: string | undefined
  setSelectedCurrency: React.Dispatch<SetStateAction<string | undefined>>
  isLoading: boolean
  swapRoutes: LifiSwapRoute[]
  swapRoutesIsLoading: boolean
}

const MAX_OPTIONS = 3

export const PayWithCryptoTab = () => {
  const { triggerAddFunds } = useAddFundsModal()
  const { clearCachedBalances } = useClearCachedBalances()
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false)
  const { openTransactionStatusModal } = useTransactionStatusModal()
  const { selectPaymentSettings = {} as SelectPaymentSettings, closeSelectPaymentModal } = useSelectPaymentModal()
  const { analytics } = useAnalyticsContext()
  const [isError, setIsError] = useState<boolean>(false)
  const { navigation, setNavigation } = useNavigationCheckout()

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
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onRampProvider,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    supplementaryAnalyticsInfo,
    slippageBps
  } = selectPaymentSettings

  const { skipOnCloseCallback } = useSkipOnCloseCallback(onClose)
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { address: userAddress, connector } = useAccount()
  const { data: walletClient } = useWalletClient({
    chainId: chainId
  })
  const publicClient = usePublicClient({
    chainId: chainId
  })
  const indexerClient = useIndexerClient(chainId)

  const selectedCurrency = navigation.params?.selectedCurrency || {
    address: currencyAddress,
    chainId: chain
  }

  const isNativeToken = compareAddress(selectedCurrency.address, zeroAddress)

  const { data: tokenBalancesData, isLoading: tokenBalancesIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [selectedCurrency.address],
      omitNativeBalances: !isNativeToken
    },
    omitMetadata: true
  })

  const { data: coinPricesData, isLoading: isLoadingCoinPrice } = useGetCoinPrices([
    {
      chainId,
      contractAddress: selectedCurrency.address
    }
  ])

  const { data: dataCurrencyInfo, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: selectPaymentSettings!.currencyAddress
  })

  const buyCurrencyAddress = currencyAddress

  const { data: swapRoutes = [], isLoading: swapRoutesIsLoading } = useGetSwapRoutes(
    {
      walletAddress: userAddress ?? '',
      chainId,
      toTokenAmount: price,
      toTokenAddress: currencyAddress
    },
    { disabled: !enableSwapPayments, retry: 3 }
  )

  const disableSwapQuote = compareAddress(selectedCurrency.address, buyCurrencyAddress)

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useGetSwapQuote(
    {
      params: {
        walletAddress: userAddress ?? '',
        toTokenAddress: buyCurrencyAddress,
        fromTokenAddress: selectedCurrency.address || '',
        toTokenAmount: price,
        chainId: chainId,
        includeApprove: true,
        slippageBps: slippageBps || 100
      }
    },
    {
      disabled: disableSwapQuote
    }
  )

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

  const isLoading =
    isLoadingCoinPrice ||
    isLoadingCurrencyInfo ||
    (allowanceIsLoading && !isNativeToken) ||
    swapRoutesIsLoading ||
    isLoadingSwapQuote ||
    tokenBalancesIsLoading

  const tokenBalance = tokenBalancesData?.pages?.[0]?.balances?.find(balance =>
    compareAddress(balance.contractAddress, selectedCurrency.address)
  )

  const isInsufficientBalance = tokenBalance?.balance && BigInt(tokenBalance.balance) < BigInt(price)

  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price) || isNativeToken

  const formattedPrice = formatUnits(BigInt(selectPaymentSettings!.price), dataCurrencyInfo?.decimals || 0)
  const displayPrice = formatDisplay(formattedPrice, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6
  })

  const fiatExchangeRate = coinPricesData?.[0].price?.value || 0
  const priceFiat = (fiatExchangeRate * Number(formattedPrice)).toFixed(2)

  const onPurchaseMainCurrency = async () => {
    if (!walletClient || !userAddress || !publicClient || !indexerClient || !connector) {
      return
    }

    setIsPurchasing(true)
    setIsError(false)

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
          source: EVENT_SOURCE,
          chainId: String(chainId),
          listedCurrency: currencyAddress,
          purchasedCurrency: currencyAddress,
          origin: window.location.origin,
          from: userAddress,
          to: targetContractAddress,
          item_ids: JSON.stringify(collectibles.map(c => c.tokenId)),
          item_quantities: JSON.stringify(collectibles.map(c => c.quantity)),
          currencySymbol: dataCurrencyInfo?.symbol || '',
          collectionAddress,
          txHash
        },
        nums: {
          currencyValue: Number(price),
          currencyValueDecimal: Number(formatUnits(BigInt(price), dataCurrencyInfo?.decimals || 18))
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

    setIsPurchasing(false)
  }

  const onClickPurchaseSwap = async () => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector || !swapQuote) {
      return
    }

    setIsPurchasing(true)
    setIsError(false)

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

      const isSwapNativeToken = compareAddress(zeroAddress, selectedCurrency.address)

      const transactions = [
        // Swap quote optional approve step
        ...(swapQuote?.approveData && !isSwapNativeToken
          ? [
              {
                to: selectedCurrency.address as Hex,
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
          source: EVENT_SOURCE,
          chainId: String(chainId),
          listedCurrency: selectedCurrency.address,
          purchasedCurrency: currencyAddress,
          origin: window.location.origin,
          from: userAddress,
          to: targetContractAddress,
          item_ids: JSON.stringify(collectibles.map(c => c.tokenId)),
          item_quantities: JSON.stringify(collectibles.map(c => c.quantity)),
          currencySymbol: dataCurrencyInfo?.symbol || '',
          collectionAddress,
          txHash
        },
        nums: {
          currencyValue: Number(price),
          currencyValueDecimal: Number(formatUnits(BigInt(price), dataCurrencyInfo?.decimals || 18))
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

    setIsPurchasing(false)
  }

  const onClickPurchase = () => {
    if (compareAddress(selectedCurrency.address, currencyAddress)) {
      onPurchaseMainCurrency()
    } else {
      onClickPurchaseSwap()
    }
  }

  const onClickAddFunds = () => {
    const getNetworks = (): string | undefined => {
      const network = findSupportedNetwork(chainId)
      return network?.name?.toLowerCase()
    }

    skipOnCloseCallback()
    closeSelectPaymentModal()
    triggerAddFunds({
      walletAddress: userAddress || '',
      provider: onRampProvider || TransactionOnRampProvider.sardine,
      networks: getNetworks(),
      defaultCryptoCurrency: dataCurrencyInfo?.symbol || '',
      onClose: selectPaymentSettings?.onClose
    })
  }

  const TokenSelector = () => {
    return (
      <div
        onClick={() => {
          setNavigation({
            location: 'token-selection',
            params: {
              selectedCurrency: {
                address: selectedCurrency.address,
                chainId: Number(selectedCurrency.chainId)
              }
            }
          })
        }}
        className="flex flex-row gap-2 justify-between items-center p-2 bg-button-glass rounded-full cursor-pointer select-none"
      >
        <TokenImage disableAnimation size="sm" src={dataCurrencyInfo?.logoURI} withNetwork={Number(selectedCurrency.chainId)} />
        <Text variant="small" color="text100" fontWeight="bold">
          {dataCurrencyInfo?.symbol}
        </Text>
        <div className="text-primary">
          <ChevronDownIcon size="md" />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center h-full">
        <Spinner />
        <Text color="text50" fontWeight="medium" variant="xsmall">
          Fetching best crypto price for this purchase
        </Text>
      </div>
    )
  }

  if (isInsufficientBalance) {
    const formattedBalance = formatUnits(BigInt(tokenBalance?.balance || '0'), dataCurrencyInfo?.decimals || 18)
    const displayBalance = formatDisplay(formattedBalance, {
      disableScientificNotation: true,
      disableCompactNotation: true,
      significantDigits: 6
    })

    return (
      <div className="flex flex-col justify-center items-center h-full w-full gap-3">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-col gap-0.5">
            <Text
              variant="xsmall"
              color="negative"
              fontWeight="bold"
              style={{
                fontSize: '24px'
              }}
            >
              {displayPrice}
            </Text>
            <div className="flex flex-row gap-1 items-center">
              <div className="text-negative">
                <WarningIcon style={{ width: '14px', height: '14px' }} />
              </div>
              <Text color="negative" variant="xsmall" fontWeight="normal">
                Insufficient funds
              </Text>
            </div>
            <Text color="negative" variant="xsmall" fontWeight="normal">
              Balance: {displayBalance} {dataCurrencyInfo?.symbol}
            </Text>
          </div>
          <div>
            <TokenSelector />
          </div>
        </div>
        <Button
          label="Add Funds"
          className="w-full"
          shape="square"
          variant="glass"
          leftIcon={() => <AddIcon size="md" />}
          onClick={onClickAddFunds}
        ></Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center items-center h-full w-full gap-3">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-col gap-0">
          <Text
            variant="xsmall"
            color="text100"
            fontWeight="bold"
            style={{
              fontSize: '24px'
            }}
          >
            {displayPrice}
          </Text>
          <div>
            <Text color="text50" variant="xsmall" fontWeight="normal">
              ~${priceFiat} USD
            </Text>
            <Text
              color="text50"
              fontWeight="bold"
              style={{
                fontSize: '10px'
              }}
            >
              &nbsp;(fees included)
            </Text>
          </div>
        </div>
        <div>
          <TokenSelector />
        </div>
      </div>

      <div className="flex flex-col justify-start items-center w-full gap-1">
        {isError && (
          <div className="flex flex-col justify-start items-center w-full">
            <Text variant="xsmall" color="negative">
              An error occurred. Please try again.
            </Text>
          </div>
        )}

        <Button
          disabled={isPurchasing}
          label="Confirm payment"
          className="w-full"
          shape="square"
          variant="primary"
          onClick={onClickPurchase}
        ></Button>
      </div>
    </div>
  )
}

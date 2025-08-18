import {
  compareAddress,
  ContractVerificationStatus,
  formatDisplay,
  sendTransactions,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  useAnalyticsContext
} from '@0xsequence/connect'
import { AddIcon, Button, ChevronDownIcon, Spinner, Text, TokenImage, WarningIcon } from '@0xsequence/design-system'
import {
  DEFAULT_SLIPPAGE_BPS,
  useClearCachedBalances,
  useGetCoinPrices,
  useGetContractInfo,
  useGetSwapQuote,
  useGetTokenBalancesSummary,
  useIndexerClient
} from '@0xsequence/hooks'
import { TransactionOnRampProvider } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState } from 'react'
import { encodeFunctionData, formatUnits, zeroAddress, type Hex } from 'viem'
import { useAccount, usePublicClient, useReadContract, useWalletClient } from 'wagmi'

import { ERC_20_CONTRACT_ABI } from '../../../../constants/abi.js'
import { EVENT_SOURCE } from '../../../../constants/index.js'
import type { SelectPaymentSettings } from '../../../../contexts/SelectPaymentModal.js'
import { useAddFundsModal } from '../../../../hooks/index.js'
import { useSelectPaymentModal, useTransactionStatusModal } from '../../../../hooks/index.js'
import { useNavigationCheckout } from '../../../../hooks/useNavigationCheckout.js'

interface PayWithCryptoTabProps {
  skipOnCloseCallback: () => void
}

export const PayWithCryptoTab = ({ skipOnCloseCallback }: PayWithCryptoTabProps) => {
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
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onRampProvider,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    supplementaryAnalyticsInfo,
    slippageBps,
    successActionButtons,
    onSuccessChecker
  } = selectPaymentSettings

  const isFree = Number(price) == 0

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

  const isNativeToken = compareAddress(currencyAddress, zeroAddress)
  const isNativeTokenSelectedCurrency = compareAddress(selectedCurrency.address, zeroAddress)

  const { data: tokenBalancesData, isLoading: tokenBalancesIsLoading } = useGetTokenBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [selectedCurrency.address],
      omitNativeBalances: !isNativeTokenSelectedCurrency
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
    contractAddress: currencyAddress
  })
  const isSwapTransaction = !compareAddress(selectedCurrency.address, currencyAddress)

  const { data: dataSelectedCurrencyInfo, isLoading: isLoadingSelectedCurrencyInfo } = useGetContractInfo(
    {
      chainID: String(chainId),
      contractAddress: selectedCurrency.address
    },
    {
      disabled: !isSwapTransaction
    }
  )

  const selectedCurrencyInfo = isSwapTransaction ? dataSelectedCurrencyInfo : dataCurrencyInfo

  const buyCurrencyAddress = currencyAddress

  const {
    data: swapQuote,
    isLoading: isLoadingSwapQuote,
    isError: isErrorSwapQuote,
    error: swapQuoteError
  } = useGetSwapQuote(
    {
      params: {
        walletAddress: userAddress ?? '',
        toTokenAddress: buyCurrencyAddress,
        fromTokenAddress: selectedCurrency.address || '',
        toTokenAmount: price,
        chainId: chainId,
        includeApprove: true,
        slippageBps: slippageBps || DEFAULT_SLIPPAGE_BPS
      }
    },
    {
      disabled: !isSwapTransaction
    }
  )

  const isNotEnoughBalanceError =
    typeof swapQuoteError?.cause === 'string' && swapQuoteError?.cause?.includes('not enough balance for swap')

  const selectedCurrencyPrice = isSwapTransaction ? swapQuote?.maxPrice || 0 : price || 0

  const { data: allowanceData, isLoading: allowanceIsLoading } = useReadContract({
    abi: ERC_20_CONTRACT_ABI,
    functionName: 'allowance',
    chainId: chainId,
    address: currencyAddress as Hex,
    args: [userAddress, approvedSpenderAddress || targetContractAddress],
    query: {
      enabled: !!userAddress && !isNativeTokenSelectedCurrency
    }
  })

  const isLoading =
    isLoadingCoinPrice ||
    isLoadingCurrencyInfo ||
    (allowanceIsLoading && !isNativeTokenSelectedCurrency) ||
    isLoadingSwapQuote ||
    tokenBalancesIsLoading ||
    isLoadingSelectedCurrencyInfo

  const tokenBalance = tokenBalancesData?.pages?.[0]?.balances?.find(balance =>
    compareAddress(balance.contractAddress, selectedCurrency.address)
  )

  const isInsufficientBalance = tokenBalance?.balance && BigInt(tokenBalance.balance) < BigInt(selectedCurrencyPrice)

  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price) || isNativeToken

  const formattedPrice = formatUnits(BigInt(selectedCurrencyPrice), selectedCurrencyInfo?.decimals || 0)
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
          ...(isNativeTokenSelectedCurrency
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
          purchasedCurrency: selectedCurrency.address,
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
        currencyAddress: selectedCurrency.address,
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
        onClose,
        successActionButtons,
        onSuccessChecker
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
        ...(isApproved || isNativeTokenSelectedCurrency
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
        currencyAddress: selectedCurrency.address,
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
        onClose,
        successActionButtons,
        onSuccessChecker
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
        <TokenImage
          disableAnimation
          size="sm"
          src={selectedCurrencyInfo?.logoURI}
          withNetwork={Number(selectedCurrency.chainId)}
        />
        <Text variant="small" color="text100" fontWeight="bold">
          {selectedCurrencyInfo?.symbol}
        </Text>
        <div className="text-primary">
          <ChevronDownIcon size="md" />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 justify-center items-center h-full pt-5">
        <Spinner />
        <Text color="text50" fontWeight="medium" variant="xsmall">
          Fetching best crypto price for this purchase
        </Text>
      </div>
    )
  }

  if (isInsufficientBalance) {
    const formattedBalance = formatUnits(BigInt(tokenBalance?.balance || '0'), selectedCurrencyInfo?.decimals || 18)
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
              Balance: {displayBalance} {selectedCurrencyInfo?.symbol}
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

  const PriceSection = () => {
    if (isFree) {
      return (
        <div className="flex flex-col mt-2 mb-1 w-full">
          <Text color="text100" variant="small" fontWeight="bold">
            This item is free, click Confirm to mint to your wallet
          </Text>
        </div>
      )
    }

    if (isNotEnoughBalanceError) {
      return (
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <Text color="negative" variant="small" fontWeight="bold">
            Insufficient funds for this purchase
          </Text>
          <div>
            <TokenSelector />
          </div>
        </div>
      )
    }

    if (isErrorSwapQuote) {
      return (
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <Text color="negative" variant="small" fontWeight="bold">
            Couldn't get a valid quote for swap, please pick another token
          </Text>
          <div>
            <TokenSelector />
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-row justify-between items-center w-full gap-2">
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
    )
  }

  const getConfirmButtonText = () => {
    if (isPurchasing) {
      return 'Confirmation in progress...'
    }

    if (isFree) {
      return 'Confirm'
    }

    return 'Confirm payment'
  }

  return (
    <div className="flex flex-col gap-4">
      <PriceSection />

      <div className="flex flex-col justify-start items-center w-full gap-1">
        {isError && (
          <div className="flex flex-col justify-start items-center w-full">
            <Text variant="xsmall" color="negative">
              An error occurred. Please try again.
            </Text>
          </div>
        )}

        <Button
          disabled={isPurchasing || isErrorSwapQuote}
          label={getConfirmButtonText()}
          className="w-full"
          shape="square"
          variant="primary"
          onClick={onClickPurchase}
        ></Button>
      </div>
    </div>
  )
}

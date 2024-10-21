import { Box, Button, Text, TextInput, SearchIcon, Scroll, Spinner } from '@0xsequence/design-system'
import {
  useBalances,
  useContractInfo,
  useCoinPrices,
  useSwapPrices,
  useSwapQuote,
  compareAddress,
  TRANSACTION_CONFIRMATIONS_DEFAULT,
  sendTransactions,
  SwapPricesWithCurrencyInfo
} from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import Fuse from 'fuse.js'
import { useState, useEffect, Fragment } from 'react'
import { encodeFunctionData, formatUnits, Hex, zeroAddress } from 'viem'
import { usePublicClient, useWalletClient, useReadContract, useAccount } from 'wagmi'

import { ERC_20_CONTRACT_ABI } from '../../../constants/abi'
import { SelectPaymentSettings } from '../../../contexts'
import { useClearCachedBalances, useSelectPaymentModal } from '../../../hooks'

import { CryptoOption } from './CryptoOption'

interface PayWithCryptoProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  setDisableButtons: React.Dispatch<React.SetStateAction<boolean>>
}

export const PayWithCrypto = ({ settings, disableButtons, setDisableButtons }: PayWithCryptoProps) => {
  const { enableSwapPayments = true, enableMainCurrencyPayment = true } = settings
  const [search, setSearch] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<string>()

  const {
    chain,
    currencyAddress,
    targetContractAddress,
    price,
    txData,
    transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
    onSuccess = () => {},
    onError = () => {}
  } = settings
  const { address: userAddress, connector } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { clearCachedBalances } = useClearCachedBalances()
  const { closeSelectPaymentModal } = useSelectPaymentModal()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

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

  const { data: swapPrices = [], isLoading: swapPricesIsLoading } = useSwapPrices({
    userAddress: userAddress ?? '',
    buyCurrencyAddress: settings?.currencyAddress,
    chainId: chainId,
    buyAmount: price,
    withContractInfo: true
  })

  const disableSwapQuote = !selectedCurrency || compareAddress(settings.currencyAddress, selectedCurrency || '')

  const { data: swapQuote, isLoading: isLoadingSwapQuote } = useSwapQuote(
    {
      userAddress: userAddress ?? '',
      buyCurrencyAddress: settings?.currencyAddress,
      buyAmount: price,
      chainId: chainId,
      sellCurrencyAddress: selectedCurrency || '',
      includeApprove: true
    },
    {
      disabled: !selectedCurrency
    }
  )

  const nativeToken = [
    {
      chainId,
      contractAddress: currencyAddress
    }
  ]

  const swapTokens = [
    ...swapPrices.map(price => ({
      chainId,
      contractAddress: price.info?.address || ''
    }))
  ]

  const { data: mainCoinPrice = [], isLoading: mainCoinsPricesIsLoading } = useCoinPrices([...nativeToken])

  const disableCoinPricesQuery = swapPricesIsLoading

  const { data: swapTokensPrices = [], isLoading: swapTokensPricesIsLoading } = useCoinPrices(
    [...swapTokens],
    disableCoinPricesQuery
  )

  const isLoading = allowanceIsLoading || currencyBalanceIsLoading || isLoadingCurrencyInfo || mainCoinsPricesIsLoading

  const swapsIsLoading = swapPricesIsLoading || swapTokensPricesIsLoading

  interface IndexedData {
    index: number
    name: string
    symbol: string
    currencyAddress: string
  }

  const indexedCoins: IndexedData[] = [
    {
      index: 0,
      name: currencyInfoData?.name || 'Unknown',
      symbol: currencyInfoData?.symbol || '',
      currencyAddress
    },
    ...swapPrices.map((price, index) => {
      return {
        index: index + 1,
        name: price.info?.name || 'Unknown',
        symbol: price.info?.symbol || '',
        currencyAddress: price.info?.address || ''
      }
    })
  ]

  const fuzzySearchCoins = new Fuse(indexedCoins, {
    keys: ['name', 'symbol', 'currencyAddress']
  })

  const foundCoins = search === '' ? indexedCoins : fuzzySearchCoins.search(search).map(result => result.item)

  const priceFormatted = formatUnits(BigInt(price), currencyInfoData?.decimals || 0)
  const isNativeToken = compareAddress(currencyAddress, zeroAddress)
  const isApproved: boolean = (allowanceData as bigint) >= BigInt(price) || isNativeToken

  const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))

  const balance: bigint = BigInt(balanceInfo?.balance || '0')
  let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

  const isNotEnoughFunds: boolean = BigInt(price) > balance

  useEffect(() => {
    clearCachedBalances()
  }, [])

  const onPurchaseMainCurrency = async () => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector) {
      return
    }

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
                value: BigInt(settings.price)
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
    }

    setDisableButtons(false)
  }

  const onClickPurchaseSwap = async (swapPrice: SwapPricesWithCurrencyInfo) => {
    if (!walletClient || !userAddress || !publicClient || !userAddress || !connector || !swapQuote) {
      return
    }

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

      const isSwapNativeToken = compareAddress(currencyAddress, swapPrice.price.currencyAddress)

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
                value: BigInt(swapQuote.price)
              }
            : {})
        },
        // Actual transaction optional approve step
        ...(isApproved
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
                value: BigInt(settings.price)
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
    }

    setDisableButtons(false)
  }

  const Options = () => {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" gap="2" width="full">
        {foundCoins.map(coin => {
          if (compareAddress(coin.currencyAddress, currencyAddress) && enableMainCurrencyPayment) {
            const coinPrice = mainCoinPrice[0]
            const exchangeRate = coinPrice?.price?.value || 0
            const priceFiat = (exchangeRate * Number(priceFormatted)).toFixed(2)

            return (
              <Fragment key={currencyAddress}>
                <CryptoOption
                  currencyName={currencyInfoData?.name || 'Unknown'}
                  chainId={chainId}
                  iconUrl={currencyInfoData?.logoURI}
                  symbol={currencyInfoData?.symbol || ''}
                  onClick={() => {
                    setSelectedCurrency(currencyAddress)
                  }}
                  balance={String(balanceFormatted)}
                  price={priceFormatted}
                  fiatPrice={priceFiat}
                  disabled={disableButtons}
                  isSelected={compareAddress(selectedCurrency || '', currencyAddress)}
                  isInsufficientFunds={isNotEnoughFunds}
                />
                {swapsIsLoading && (
                  <Box justifyContent="center" alignItems="center" width="full" marginTop="4">
                    <Spinner />
                  </Box>
                )}
              </Fragment>
            )
          } else {
            const foundCoinPrice = swapTokensPrices.find(coinPrice =>
              compareAddress(coinPrice.token.contractAddress, coin.currencyAddress)
            )
            const exchangeRate = foundCoinPrice?.price?.value || 0

            const swapPrice = swapPrices?.find(price => compareAddress(price.info?.address || '', coin.currencyAddress))
            const currencyInfoNotFound =
              !swapPrice || !swapPrice.info || swapPrice?.info?.decimals === undefined || !swapPrice.balance?.balance
            if (currencyInfoNotFound || !enableSwapPayments) {
              return null
            }
            const swapQuotePriceFormatted = formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 18)
            const balanceFormatted = formatUnits(BigInt(swapPrice.balance?.balance || 0), swapPrice.info?.decimals || 18)
            const swapQuoteAddress = swapPrice.info?.address || ''

            const priceFiat = (exchangeRate * Number(swapQuotePriceFormatted)).toFixed(2)

            return (
              <CryptoOption
                key={swapQuoteAddress}
                currencyName={swapPrice.info?.name || 'Unknown'}
                chainId={chainId}
                iconUrl={swapPrice.info?.logoURI}
                symbol={swapPrice.info?.symbol || ''}
                onClick={() => {
                  setSelectedCurrency(swapQuoteAddress)
                }}
                balance={String(Number(balanceFormatted).toPrecision(4))}
                price={String(Number(swapQuotePriceFormatted).toPrecision(4))}
                fiatPrice={priceFiat}
                disabled={disableButtons}
                isSelected={compareAddress(selectedCurrency || '', swapQuoteAddress)}
                isInsufficientFunds={false}
              />
            )
          }
        })}
      </Box>
    )
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
    <Box>
      <Box width="full" marginTop="4">
        <TextInput
          autoFocus
          name="Search"
          leftIcon={SearchIcon}
          value={search}
          onChange={ev => setSearch(ev.target.value)}
          placeholder="Search your coins"
          data-1p-ignore
        />
      </Box>
      <Box marginTop="3">
        <Text variant="small" fontWeight="medium" color="text50">
          Select a crypto
        </Text>
      </Box>
      <Scroll paddingTop="3" style={{ height: '259px' }}>
        {isLoading ? (
          <Box width="full" paddingTop="5" justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        ) : (
          <Options />
        )}
      </Scroll>
      <Button
        onClick={onClickPurchase}
        disabled={isLoading || disableButtons || !selectedCurrency || (!disableSwapQuote && isLoadingSwapQuote)}
        marginTop="2"
        shape="square"
        variant="primary"
        width="full"
        label="Complete Purchase"
      />
    </Box>
  )
}

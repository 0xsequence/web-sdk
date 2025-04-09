import { SwapQuote } from '@0xsequence/api'
import { sendTransactions } from '@0xsequence/connect'
import {
  ArrowRightIcon,
  Card,
  cardVariants,
  cn,
  compareAddress,
  IconButton,
  Spinner,
  Text,
  useToast
} from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetTokenBalancesSummary, useIndexerClient } from '@0xsequence/hooks'
import { useAPIClient } from '@0xsequence/hooks'
import { useEffect, useState } from 'react'
import { formatUnits, Hex, zeroAddress } from 'viem'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'

import { NetworkSelect } from '../../components/Select/NetworkSelect'
import { HEADER_HEIGHT_WITH_LABEL } from '../../constants'
import { useSettings } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'
import { decimalsToWei } from '../../utils/formatBalance'

import { CoinInput } from './CoinInput'
import { CoinSelect } from './CoinSelect'

export const Swap = () => {
  const toast = useToast()
  const { fiatCurrency } = useSettings()
  const { address: userAddress, connector } = useAccount()
  const connectedChainId = useChainId()
  const { data: walletClient } = useWalletClient({ chainId: connectedChainId })
  const publicClient = usePublicClient({ chainId: connectedChainId })
  const indexerClient = useIndexerClient(connectedChainId)

  const [fromCoin, __setFromCoin] = useState<TokenBalanceWithPrice>()
  const [fromAmount, setFromAmount] = useState<string>('')

  const [toCoin, __setToCoin] = useState<TokenBalanceWithPrice>()
  const [toAmount, setToAmount] = useState<string>('')

  const [recentInput, setRecentInput] = useState<'from' | 'to'>('from')

  const [swapQuoteData, setSwapQuoteData] = useState<SwapQuote>()
  const [isSwapQuotePending, setIsSwapQuotePending] = useState(false)
  const [isErrorSwapQuote, setIsErrorSwapQuote] = useState(false)
  const [isTxnPending, setIsTxnPending] = useState(false)
  const [isErrorTxn, setIsErrorTxn] = useState(false)

  // Do not remove these unused states, they will be used in future updates

  const apiClient = useAPIClient()

  useEffect(() => {
    __setFromCoin(undefined)
    setFromAmount('')
    __setToCoin(undefined)
    setToAmount('')
    setRecentInput('from')
    setSwapQuoteData(undefined)
    setIsSwapQuotePending(false)
    setIsErrorSwapQuote(false)
    setIsTxnPending(false)
    setIsErrorTxn(false)
  }, [userAddress, connectedChainId])

  const { data: tokenBalances } = useGetTokenBalancesSummary({
    chainIds: [connectedChainId],
    filter: {
      accountAddresses: [String(userAddress)],
      omitNativeBalances: false
    }
  })

  const coinBalances = tokenBalances?.filter(c => c.contractType !== 'ERC1155' && c.contractType !== 'ERC721') || []

  const { data: coinPrices = [] } = useGetCoinPrices(
    coinBalances.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1 } = useGetExchangeRate(fiatCurrency.symbol)

  const coinBalancesWithPrices = coinBalances.map(balance => {
    const matchingPrice = coinPrices.find(price => {
      const isSameChainAndAddress =
        price.token.chainId === balance.chainId && price.token.contractAddress === balance.contractAddress

      const isTokenIdMatch =
        price.token.tokenId === balance.tokenID || !(balance.contractType === 'ERC721' || balance.contractType === 'ERC1155')

      return isSameChainAndAddress && isTokenIdMatch
    })

    const priceValue = (matchingPrice?.price?.value || 0) * conversionRate
    const priceCurrency = fiatCurrency.symbol

    return {
      ...balance,
      price: { value: priceValue, currency: priceCurrency }
    }
  })

  const handleInputChange = (amount: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromAmount(amount)
      if (Number(amount) === 0) {
        setRecentInput('to')
      }
    } else {
      setToAmount(amount)
      if (Number(amount) === 0) {
        setRecentInput('from')
      }
    }
  }

  const handleCoinSelect = (coin: TokenBalanceWithPrice, type: 'from' | 'to') => {
    if (type === 'from') {
      if (coin.contractAddress === toCoin?.contractAddress) {
        switchCoinInputs()
      } else {
        __setFromCoin(coin)
        handleInputChange('', 'from')
      }
    } else {
      if (coin.contractAddress === fromCoin?.contractAddress) {
        switchCoinInputs()
      } else {
        __setToCoin(coin)
        handleInputChange('', 'to')
      }
    }
  }

  const switchCoinInputs = () => {
    const tempFrom = fromCoin
    const tempTo = toCoin
    const tempFromAmount = fromAmount
    const tempToAmount = toAmount
    __setFromCoin(tempTo)
    __setToCoin(tempFrom)
    setFromAmount(tempToAmount)
    setToAmount(tempFromAmount)
  }

  const onClickSwap = async () => {
    if (!userAddress || !publicClient || !walletClient || !connector) {
      return
    }

    setIsErrorTxn(false)
    setIsTxnPending(true)

    try {
      const isSwapNativeToken = compareAddress(zeroAddress, swapQuoteData?.currencyAddress || '')
      const getSwapTransactions = () => {
        if (!swapQuoteData) {
          return []
        }

        const swapTransactions = [
          // Swap quote optional approve step
          ...(swapQuoteData?.approveData && !isSwapNativeToken
            ? [
                {
                  to: toCoin?.contractAddress as Hex,
                  data: swapQuoteData?.approveData as Hex,
                  chain: connectedChainId
                }
              ]
            : []),
          // Swap quote tx
          {
            to: swapQuoteData?.to as Hex,
            data: swapQuoteData?.transactionData as Hex,
            chain: connectedChainId,
            ...(isSwapNativeToken
              ? {
                  value: BigInt(swapQuoteData?.transactionValue)
                }
              : {})
          }
        ]
        return swapTransactions
      }

      const walletClientChainId = await walletClient?.getChainId()
      if (walletClientChainId !== connectedChainId) {
        await walletClient?.switchChain({ id: connectedChainId })
      }

      const txHash = await sendTransactions({
        connector,
        walletClient,
        publicClient,
        chainId: connectedChainId,
        indexerClient,
        senderAddress: userAddress,
        transactions: getSwapTransactions()
      })

      toast({
        title: 'Transaction sent',
        description: `Successfully swapped ${fromAmount} ${fromCoin?.contractInfo?.name} for ${toAmount} ${toCoin?.contractInfo?.name}`,
        variant: 'success'
      })
    } catch (error) {
      setIsErrorTxn(true)
      setIsTxnPending(false)
      console.error('Failed to send transactions', error)
    }

    setIsTxnPending(false)
  }

  useEffect(() => {
    const fetchSwapQuote = async () => {
      setIsSwapQuotePending(true)
      setIsErrorSwapQuote(false)

      let swapQuote
      try {
        swapQuote = await apiClient.getSwapQuoteV2({
          userAddress: String(userAddress),
          buyCurrencyAddress: toCoin?.contractAddress || '',
          sellCurrencyAddress: fromCoin?.contractAddress || '',
          buyAmount: decimalsToWei(toAmount, toCoin?.contractInfo?.decimals || 18) || '0',
          chainId: toCoin?.chainId || 1,
          includeApprove: true
        })

        // TODO: change to multi-directional swap quote

        console.log(swapQuote?.swapQuote)

        const transactionValue = swapQuote?.swapQuote?.transactionValue || '0'
        const newFromAmount = formatUnits(BigInt(Number(transactionValue)), fromCoin?.contractInfo?.decimals || 18)

        handleInputChange(newFromAmount, 'from')
      } catch (error) {
        setIsErrorSwapQuote(true)
        handleInputChange('0', 'from')
      }

      setSwapQuoteData(swapQuote?.swapQuote)
      setIsSwapQuotePending(false)
    }
    if (fromCoin && toCoin && (Number(fromAmount) > 0 || Number(toAmount) > 0)) {
      fetchSwapQuote()
    }
  }, [fromCoin, toCoin, fromAmount, toAmount])

  return (
    <div className="flex flex-col justify-center items-center px-4 pb-4 gap-4" style={{ paddingTop: HEADER_HEIGHT_WITH_LABEL }}>
      <NetworkSelect />
      <div className="flex gap-1 flex-col w-full">
        <Card className="flex flex-col rounded-b-none rounded-t-xl relative pb-6" style={{ overflow: 'visible' }}>
          <CoinSelect
            selectedCoin={fromCoin}
            setSelectedCoin={handleCoinSelect}
            coinList={coinBalancesWithPrices || []}
            selectType="from"
          />
          {fromCoin && <CoinInput disabled coin={fromCoin} type="from" value={fromAmount} setValue={handleInputChange} />}
          {isErrorSwapQuote && (
            <Text className="mt-2" variant="normal" color="negative">
              Insufficient Funds
            </Text>
          )}

          <div className="flex w-full justify-center">
            <div
              className="rounded-full bg-background-primary absolute p-1"
              style={{ bottom: '-19px', zIndex: 2, rotate: '90deg' }}
            >
              <IconButton icon={ArrowRightIcon} onClick={switchCoinInputs} size="xs" />
            </div>
          </div>
        </Card>
        <Card className="rounded-t-none rounded-b-xl relative pt-6">
          <CoinSelect
            selectedCoin={toCoin}
            setSelectedCoin={handleCoinSelect}
            coinList={coinBalancesWithPrices || []}
            selectType="to"
          />
          {toCoin && <CoinInput coin={toCoin} type="to" value={toAmount} setValue={handleInputChange} />}
          {fromCoin && toCoin && (Number(fromAmount) > 0 || Number(toAmount) > 0) && isSwapQuotePending && (
            <div className="flex mt-4 gap-2 items-center">
              <Spinner />
              <Text variant="normal" color="muted">
                Fetching best price quote…
              </Text>
            </div>
          )}
        </Card>
      </div>
      <div
        className={cn(
          cardVariants({ clickable: true, disabled: isSwapQuotePending || !swapQuoteData || isErrorSwapQuote || isTxnPending }),
          'flex justify-center items-center bg-gradient-primary rounded-full gap-2 p-3'
        )}
        onClick={onClickSwap}
      >
        <Text color="primary" fontWeight="bold" variant="normal">
          Swap
        </Text>
      </div>
    </div>
  )
}

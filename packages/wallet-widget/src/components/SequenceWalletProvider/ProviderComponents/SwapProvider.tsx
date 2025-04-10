import { SwapQuote } from '@0xsequence/api'
import { sendTransactions } from '@0xsequence/connect'
import { compareAddress, useToast } from '@0xsequence/design-system'
import { useAPIClient, useIndexerClient } from '@0xsequence/hooks'
import { ReactNode, useEffect, useState } from 'react'
import { Hex, zeroAddress } from 'viem'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'

import { SwapContextProvider } from '../../../contexts/Swap'
import { useNavigation } from '../../../hooks/useNavigation'
import { TokenBalanceWithPrice } from '../../../utils'

export const SwapProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast()
  const { address: userAddress, connector } = useAccount()
  const { setNavigation } = useNavigation()
  const apiClient = useAPIClient()
  const connectedChainId = useChainId()

  const [fromCoin, _setFromCoin] = useState<TokenBalanceWithPrice>()
  const [fromAmount, setFromAmount] = useState<number>(0)
  const [toCoin, _setToCoin] = useState<TokenBalanceWithPrice>()
  const [toAmount, setToAmount] = useState<number>(0)
  const [recentInput, setRecentInput] = useState<'from' | 'to'>('from')
  const [setNonRecentAmount, _setNonRecentAmount] = useState<() => void>(() => 0)

  const [isSwapReady, setIsSwapReady] = useState(false)
  const [swapQuoteData, setSwapQuoteData] = useState<SwapQuote>()
  const [isSwapQuotePending, setIsSwapQuotePending] = useState(false)
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
  const [isErrorSwapQuote, setIsErrorSwapQuote] = useState(false)

  const [isTxnPending, setIsTxnPending] = useState(false)
  const [isErrorTxn, setIsErrorTxn] = useState(false)

  const publicClient = usePublicClient({ chainId: connectedChainId })
  const { data: walletClient } = useWalletClient({ chainId: connectedChainId })
  const indexerClient = useIndexerClient(connectedChainId)

  useEffect(() => {
    setFromCoin(undefined)
    setFromAmount(0)
    setToCoin(undefined)
    setToAmount(0)
    setRecentInput('from')
    setIsSwapReady(false)
    setSwapQuoteData(undefined)
    setIsSwapQuotePending(false)
    setIsErrorSwapQuote(false)
    setIsTxnPending(false)
    setIsErrorTxn(false)
  }, [userAddress, connectedChainId])

  useEffect(() => {
    if (recentInput === 'from') {
      _setNonRecentAmount(() => setFromAmount)
    } else {
      _setNonRecentAmount(() => setToAmount)
    }
  }, [recentInput])

  useEffect(() => {
    setIsSwapReady(false)
    setSwapQuoteData(undefined)
    setIsErrorSwapQuote(false)
  }, [fromCoin, toCoin, fromAmount, toAmount])

  useEffect(() => {
    const fetchSwapQuote = async () => {
      if (!fromCoin || !toCoin || (fromAmount === 0 && toAmount === 0)) {
        return
      }

      setIsSwapQuotePending(true)
      setIsErrorSwapQuote(false)

      let swapQuote
      try {
        // swapQuote = await apiClient.getSwapQuoteV2({
        //   userAddress: String(userAddress),
        //   buyCurrencyAddress: toCoin.contractAddress,
        //   sellCurrencyAddress: fromCoin.contractAddress,
        //   tokenAmount: String(recentInput === 'to' ? toAmount : fromAmount),
        //   isBuyAmount: recentInput === 'to',
        //   chainId: connectedChainId,
        //   includeApprove: true
        // })

        swapQuote = await apiClient.getSwapQuoteV2({
          userAddress: String(userAddress),
          buyCurrencyAddress: toCoin.contractAddress,
          sellCurrencyAddress: fromCoin.contractAddress,
          buyAmount: String(toAmount),
          chainId: connectedChainId,
          includeApprove: true
        })

        const transactionValue = swapQuote?.swapQuote?.transactionValue || '0'

        // TODO: change this to "amount" from return

        if (recentInput === 'from') {
          setToAmount(Number(transactionValue))
        } else {
          setFromAmount(Number(transactionValue))
        }

        setSwapQuoteData(swapQuote?.swapQuote)
        setIsSwapReady(true)
      } catch (error) {
        const hasInsufficientFunds = (error as any).code === -4
        setHasInsufficientFunds(hasInsufficientFunds)
        setIsErrorSwapQuote(true)
      }
      setIsSwapQuotePending(false)
    }

    fetchSwapQuote()
  }, [fromCoin, toCoin, fromAmount, toAmount])

  const setFromCoin = (coin: TokenBalanceWithPrice | undefined) => {
    if (coin?.chainId === toCoin?.chainId && coin?.contractAddress === toCoin?.contractAddress) {
      switchCoinOrder()
    } else {
      _setFromCoin(coin)
    }
  }

  const setToCoin = (coin: TokenBalanceWithPrice | undefined) => {
    if (coin?.chainId === fromCoin?.chainId && coin?.contractAddress === fromCoin?.contractAddress) {
      switchCoinOrder()
    } else {
      _setToCoin(coin)
    }
  }

  const switchCoinOrder = () => {
    const tempFrom = fromCoin
    const tempTo = toCoin
    const tempFromAmount = fromAmount
    const tempToAmount = toAmount
    _setFromCoin(tempTo)
    _setToCoin(tempFrom)
    setFromAmount(tempToAmount)
    setToAmount(tempFromAmount)
  }

  const onSubmitSwap = async () => {
    if (isErrorSwapQuote || !userAddress || !publicClient || !walletClient || !connector) {
      console.error('Please ensure validation before submitting')
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
                  to: swapQuoteData?.currencyAddress as Hex,
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
                  value: BigInt(swapQuoteData?.transactionValue || '0')
                }
              : {})
          }
        ]
        return swapTransactions
      }

      const walletClientChainId = await walletClient.getChainId()
      if (walletClientChainId !== connectedChainId) {
        await walletClient.switchChain({ id: connectedChainId })
      }

      await sendTransactions({
        connector,
        walletClient,
        publicClient,
        chainId: connectedChainId,
        indexerClient,
        senderAddress: userAddress,
        transactions: [...getSwapTransactions()]
      })

      toast({
        title: 'Transaction sent',
        description: `Successfully swapped ${fromAmount} ${fromCoin?.contractInfo?.name} for ${toAmount} ${toCoin?.contractInfo?.name}`,
        variant: 'success'
      })

      setNavigation({
        location: 'home'
      })
    } catch (error) {
      console.error('Failed to send transactions', error)
      setIsSwapReady(false)
      setIsTxnPending(false)
      setIsErrorTxn(true)
    }
  }

  return (
    <SwapContextProvider
      value={{
        fromCoin,
        fromAmount,
        toCoin,
        toAmount,
        recentInput,
        isSwapReady,
        isSwapQuotePending,
        hasInsufficientFunds,
        isErrorSwapQuote,
        isTxnPending,
        isErrorTxn,
        setFromCoin,
        setFromAmount,
        setToCoin,
        setToAmount,
        setRecentInput,
        setNonRecentAmount,
        switchCoinOrder,
        onSubmitSwap
      }}
    >
      {children}
    </SwapContextProvider>
  )
}

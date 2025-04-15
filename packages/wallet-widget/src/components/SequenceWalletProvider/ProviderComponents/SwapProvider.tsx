import { SwapQuote } from '@0xsequence/api'
import { getNativeTokenInfoByChainId, sendTransactions } from '@0xsequence/connect'
import { compareAddress, useToast } from '@0xsequence/design-system'
import { useAPIClient, useIndexerClient } from '@0xsequence/hooks'
import { ReactNode, useEffect, useState } from 'react'
import { formatUnits, Hex, zeroAddress } from 'viem'
import { useAccount, useChainId, useChains, usePublicClient, useWalletClient } from 'wagmi'

import { SwapContextProvider } from '../../../contexts/Swap'
import { useNavigation } from '../../../hooks/useNavigation'
import { TokenBalanceWithPrice } from '../../../utils'

export const SwapProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast()
  const { address: userAddress, connector } = useAccount()
  const { setNavigation } = useNavigation()
  const apiClient = useAPIClient()
  const connectedChainId = useChainId()
  const chains = useChains()
  const [fromCoin, _setFromCoin] = useState<TokenBalanceWithPrice>()
  const [toCoin, _setToCoin] = useState<TokenBalanceWithPrice>()
  const [amount, _setAmount] = useState<number>(0)
  const [nonRecentAmount, setNonRecentAmount] = useState<number>(0)
  const [recentInput, setRecentInput] = useState<'from' | 'to'>('from')

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

  const resetSwapStates = () => {
    _setFromCoin(undefined)
    _setToCoin(undefined)
    _setAmount(0)
    setNonRecentAmount(0)
    setRecentInput('from')
    setIsSwapReady(false)
    setSwapQuoteData(undefined)
    setIsSwapQuotePending(false)
    setIsErrorSwapQuote(false)
    setIsTxnPending(false)
    setIsErrorTxn(false)
  }

  useEffect(() => {
    resetSwapStates()
  }, [userAddress, connectedChainId])

  useEffect(() => {
    setIsSwapReady(false)
    setSwapQuoteData(undefined)
    setIsErrorSwapQuote(false)
  }, [fromCoin, toCoin, amount])

  useEffect(() => {
    const fetchSwapQuote = async () => {
      if (!fromCoin || !toCoin || amount === 0) {
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
        //   chainId: connectedChainId,
        //   includeApprove: true
        //   ...(recentInput === 'from' ? {sellAmount: String(amount)} : {buyAmount: String(amount)})
        // })

        // TODO: use commented out code when getSwapQuoteV2 is updated to include sellAmount

        swapQuote = await apiClient.getSwapQuoteV2({
          userAddress: String(userAddress),
          buyCurrencyAddress: toCoin.contractAddress,
          sellCurrencyAddress: fromCoin.contractAddress,
          buyAmount: String(amount),
          chainId: connectedChainId,
          includeApprove: true
        })

        const transactionValue = swapQuote?.swapQuote?.transactionValue || '0'
        // TODO: change this to "amount" from return

        setNonRecentAmount(Number(transactionValue))

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
  }, [fromCoin, toCoin, amount])

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

  const setAmount = (newAmount: number, type: 'from' | 'to') => {
    if (type === recentInput) {
      _setAmount(newAmount)
    } else {
      const tempAmount = amount
      setRecentInput(recentInput === 'from' ? 'to' : 'from')
      _setAmount(newAmount)
      setNonRecentAmount(tempAmount)
    }
  }

  const switchCoinOrder = () => {
    const tempFrom = fromCoin
    const tempTo = toCoin
    _setFromCoin(tempTo)
    _setToCoin(tempFrom)
    setRecentInput(recentInput === 'from' ? 'to' : 'from')
  }

  const onSubmitSwap = async () => {
    if (isErrorSwapQuote || !userAddress || !publicClient || !walletClient || !connector || !fromCoin || !toCoin || !amount) {
      console.error('Please ensure validation before allowing users to submit a swap')
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

      const isFromCoinNative = fromCoin.contractType === 'NATIVE'
      const isToCoinNative = toCoin.contractType === 'NATIVE'
      const fromCoinNativeInfo = getNativeTokenInfoByChainId(fromCoin.chainId, chains)
      const toCoinNativeInfo = getNativeTokenInfoByChainId(toCoin.chainId, chains)
      const toastFromCoinName = isFromCoinNative ? fromCoinNativeInfo.symbol : fromCoin.contractInfo?.symbol
      const toastToCoinName = isToCoinNative ? toCoinNativeInfo.symbol : toCoin.contractInfo?.symbol
      const toastFromAmount = formatUnits(
        BigInt(recentInput === 'from' ? amount : nonRecentAmount),
        (isFromCoinNative ? fromCoinNativeInfo.decimals : fromCoin.contractInfo?.decimals) || 18
      )
      const toastToAmount = formatUnits(
        BigInt(recentInput === 'from' ? nonRecentAmount : amount),
        (isToCoinNative ? toCoinNativeInfo.decimals : toCoin.contractInfo?.decimals) || 18
      )

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
        description: `Successfully swapped ${toastFromAmount} ${toastFromCoinName} for ${toastToAmount} ${toastToCoinName}`,
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
        toCoin,
        amount,
        nonRecentAmount,
        recentInput,
        isSwapReady,
        isSwapQuotePending,
        hasInsufficientFunds,
        isErrorSwapQuote,
        isTxnPending,
        isErrorTxn,
        setFromCoin,
        setToCoin,
        setAmount,
        switchCoinOrder,
        onSubmitSwap,
        resetSwapStates
      }}
    >
      {children}
    </SwapContextProvider>
  )
}

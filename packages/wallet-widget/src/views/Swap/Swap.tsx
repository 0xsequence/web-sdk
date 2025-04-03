import { SwapQuote } from '@0xsequence/api'
import { SwapModalSettings } from '@0xsequence/checkout'
import { ArrowRightIcon, Card, cardVariants, cn, IconButton, Text } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetSwapQuote, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { useEffect, useState } from 'react'
import { encodeFunctionData } from 'viem'
import { parseAbi, zeroAddress } from 'viem'
import { useAccount, useChainId } from 'wagmi'

import { NetworkSelect } from '../../components/NetworkSelect'
import { useSettings } from '../../hooks'
import { TokenBalanceWithPrice } from '../../utils'

import { CoinInput } from './CoinInput'
import { CoinSelect } from './CoinSelect'

export const Swap = () => {
  const { fiatCurrency } = useSettings()
  const { address } = useAccount()
  const connectedChainId = useChainId()

  const [fromCoin, __setFromCoin] = useState<TokenBalanceWithPrice>()
  const [fromAmount, setFromAmount] = useState<string>('')

  const [toCoin, __setToCoin] = useState<TokenBalanceWithPrice>()
  const [toAmount, setToAmount] = useState<string>('')

  const { data: swapQuoteData } = useGetSwapQuote({
    userAddress: String(address),
    buyCurrencyAddress: fromCoin?.contractAddress || '',
    sellCurrencyAddress: toCoin?.contractAddress || '',
    buyAmount: fromCoin?.balance || '0',
    chainId: fromCoin?.chainId || 1,
    includeApprove: true
  })

  useEffect(() => {
    if (fromCoin && toCoin && swapQuoteData) {
      console.log(fromCoin, toCoin, swapQuoteData)
    }
  }, [fromCoin, toCoin, swapQuoteData])

  const switchCoinInputs = () => {
    const tempFrom = fromCoin
    const tempTo = toCoin
    __setFromCoin(tempTo)
    __setToCoin(tempFrom)
  }

  const setFromCoin = (coin: TokenBalanceWithPrice) => {
    if (coin.contractAddress === toCoin?.contractAddress) {
      switchCoinInputs()
    } else {
      __setFromCoin(coin)
    }
  }

  const setToCoin = (coin: TokenBalanceWithPrice) => {
    if (coin.contractAddress === fromCoin?.contractAddress) {
      switchCoinInputs()
    } else {
      __setToCoin(coin)
    }
  }

  const { data: tokenBalances, isPending: tokenBalancesPending } = useGetTokenBalancesSummary({
    chainIds: [connectedChainId],
    filter: {
      accountAddresses: [String(address)],
      omitNativeBalances: false
    }
  })

  const coinBalances = tokenBalances?.filter(c => c.contractType !== 'ERC1155' && c.contractType !== 'ERC721') || []

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useGetCoinPrices(
    coinBalances.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isConversionRatePending } = useGetExchangeRate(fiatCurrency.symbol)

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

  const onClickSwap = () => {
    const chainId = 137
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const currencyAmount = '20000'
    const data = encodeFunctionData({ abi: parseAbi(['function demo()']), functionName: 'demo', args: [] })

    const swapModalSettings: SwapModalSettings = {
      onSuccess: () => {
        console.log('swap successful!')
      },
      chainId,
      currencyAddress,
      currencyAmount,
      postSwapTransactions: [
        {
          to: '0x37470dac8a0255141745906c972e414b1409b470',
          data
        }
      ],
      title: 'Swap and Pay',
      description: 'Select a token in your wallet to swap to 0.2 USDC.'
    }
  }

  return (
    <div className="flex flex-col justify-center items-center px-4 pb-4 gap-4">
      <NetworkSelect />
      <div className="flex gap-1 flex-col w-full">
        <Card className="rounded-b-none rounded-t-xl relative pb-6" style={{ overflow: 'visible' }}>
          <CoinSelect
            selectedCoin={fromCoin}
            setSelectedCoin={setFromCoin}
            coinList={coinBalancesWithPrices || []}
            selectType="From"
          />
          {fromCoin && <CoinInput coin={fromCoin} type="from" setAmount={setFromAmount} />}

          <div className="flex w-full justify-center">
            <div
              className="rounded-full bg-background-primary absolute p-1"
              style={{ bottom: '-19px', zIndex: 2, rotate: '90deg' }}
            >
              <IconButton icon={ArrowRightIcon} onClick={switchCoinInputs} size="xs" />
            </div>
          </div>
        </Card>
        <Card className="rounded-t-none rounded-b-xl relative pt-6" style={{ overflow: 'visible' }}>
          <CoinSelect selectedCoin={toCoin} setSelectedCoin={setToCoin} coinList={coinBalancesWithPrices || []} selectType="To" />
          {toCoin && <CoinInput coin={toCoin} type="to" setAmount={setToAmount} />}
        </Card>
      </div>
      <div
        className={cn(
          cardVariants({ clickable: true }),
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
function useGetTokenPrices(arg0: { chainIds: number[]; tokenAddresses: string[] | undefined }): { data: any; isPending: any } {
  throw new Error('Function not implemented.')
}

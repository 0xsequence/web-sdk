import { ArrowRightIcon, Card, cardVariants, cn, IconButton, Spinner, Text } from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'

import { NetworkSelect } from '../../components/Select/NetworkSelect'
import { HEADER_HEIGHT_WITH_LABEL } from '../../constants'
import { useSettings, useSwap } from '../../hooks'

import { CoinInput } from './CoinInput'
import { CoinSelect } from './CoinSelect'

export const Swap = () => {
  const {
    fromCoin,
    toCoin,
    isSwapReady,
    isSwapQuotePending,
    hasInsufficientFunds,
    isErrorSwapQuote,
    isTxnPending,
    switchCoinOrder,
    onSubmitSwap,
    resetSwapStates
  } = useSwap()
  const { fiatCurrency } = useSettings()
  const { address: userAddress } = useAccount()
  const connectedChainId = useChainId()

  useEffect(() => {
    return resetSwapStates()
  }, [])

  const { data: tokenBalances } = useGetTokenBalancesSummary({
    chainIds: [connectedChainId],
    filter: {
      accountAddresses: [String(userAddress)],
      omitNativeBalances: false
    }
  })

  // TODO: add new Lifi endpoints to get buy token as well as supported networks GetLifiChains and GetLifiTokens

  const coinBalances =
    tokenBalances?.pages
      .flatMap(page => page.balances)
      .filter(c => c.contractType !== 'ERC1155' && c.contractType !== 'ERC721') || []

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

  return (
    <div className="flex flex-col justify-center items-center px-4 pb-4 gap-4" style={{ paddingTop: HEADER_HEIGHT_WITH_LABEL }}>
      <NetworkSelect />
      <div className="flex gap-1 flex-col w-full">
        <Card className="flex flex-col rounded-b-none rounded-t-xl relative pb-6" style={{ overflow: 'visible' }}>
          <CoinSelect disabled={isTxnPending} coinList={coinBalancesWithPrices || []} selectType="from" />
          {fromCoin && <CoinInput disabled={true} type="from" />}
          {/* TODO: change out disabled to isTxnPending after new swap api is implemented */}
          {isErrorSwapQuote &&
            (hasInsufficientFunds ? (
              <Text className="mt-2" variant="normal" color="negative">
                Insufficient Funds
              </Text>
            ) : (
              <Text className="mt-2" variant="normal" color="negative">
                Something went wrong. Try again later or with a different combination of coins.
              </Text>
            ))}

          <div className="flex w-full justify-center">
            <div
              className="rounded-full bg-background-primary absolute p-1"
              style={{ bottom: '-19px', zIndex: 2, rotate: '90deg' }}
            >
              <IconButton icon={ArrowRightIcon} disabled={isTxnPending} onClick={switchCoinOrder} size="xs" />
            </div>
          </div>
        </Card>
        <Card className="rounded-t-none rounded-b-xl relative pt-6">
          <CoinSelect disabled={isTxnPending} coinList={coinBalancesWithPrices || []} selectType="to" />
          {toCoin && <CoinInput disabled={isTxnPending} type="to" />}
          {isSwapQuotePending && (
            <div className="flex mt-4 gap-2 items-center">
              <Spinner />
              <Text variant="normal" color="muted">
                Fetching best price quote…
              </Text>
            </div>
          )}
          {isTxnPending && (
            <div className="flex mt-4 gap-2 items-center">
              <Spinner />
              <Text variant="normal" color="muted">
                Sending swap transaction…
              </Text>
            </div>
          )}
        </Card>
      </div>
      <div
        className={cn(
          cardVariants({ clickable: true, disabled: isSwapQuotePending || !isSwapReady || isErrorSwapQuote || isTxnPending }),
          'flex justify-center items-center bg-gradient-primary rounded-full gap-2 p-3'
        )}
        onClick={onSubmitSwap}
      >
        <Text color="primary" fontWeight="bold" variant="normal">
          Swap
        </Text>
      </div>
    </div>
  )
}

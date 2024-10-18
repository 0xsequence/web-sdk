import { Box, Text, Scroll, Spinner } from '@0xsequence/design-system'
import { useBalances, useContractInfo, useSwapPrices, compareAddress, NATIVE_TOKEN_ADDRESS_0X } from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState, useEffect, Fragment, SetStateAction } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { SelectPaymentSettings } from '../../../contexts'
import { useClearCachedBalances } from '../../../hooks'

import { CryptoOption } from './CryptoOption'

interface PayWithCryptoProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  selectedCurrency: string | undefined
  setSelectedCurrency: React.Dispatch<SetStateAction<string | undefined>>
  isLoading: boolean
}

export const PayWithCrypto = ({
  settings,
  disableButtons,
  selectedCurrency,
  setSelectedCurrency,
  isLoading
}: PayWithCryptoProps) => {
  const { enableSwapPayments = true, enableMainCurrencyPayment = true } = settings

  const { chain, currencyAddress, price } = settings
  const { address: userAddress } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: currencyBalanceData, isLoading: currencyBalanceIsLoading } = useBalances({
    chainIds: [chainId],
    contractAddress: currencyAddress,
    accountAddress: userAddress || '',
    // includeMetadata must be false to work around a bug
    includeMetadata: false
  })

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useContractInfo(chainId, currencyAddress)

  const buyCurrencyAddress = compareAddress(settings?.currencyAddress, zeroAddress)
    ? NATIVE_TOKEN_ADDRESS_0X
    : settings?.currencyAddress

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

  const isLoadingOptions = currencyBalanceIsLoading || isLoadingCurrencyInfo || isLoading

  const swapsIsLoading = swapPricesIsLoading

  interface Coin {
    index: number
    name: string
    symbol: string
    currencyAddress: string
  }

  const coins: Coin[] = [
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

  const priceFormatted = formatUnits(BigInt(price), currencyInfoData?.decimals || 0)

  const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))

  const balance: bigint = BigInt(balanceInfo?.balance || '0')
  let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

  const isNotEnoughFunds: boolean = BigInt(price) > balance

  useEffect(() => {
    clearCachedBalances()
  }, [])

  const Options = () => {
    return (
      <Box flexDirection="column" justifyContent="center" alignItems="center" gap="2" width="full">
        {coins.map(coin => {
          if (compareAddress(coin.currencyAddress, currencyAddress) && enableMainCurrencyPayment) {
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
                  price={priceFormatted}
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
            const swapPrice = swapPrices?.find(price => compareAddress(price.info?.address || '', coin.currencyAddress))
            const currencyInfoNotFound =
              !swapPrice || !swapPrice.info || swapPrice?.info?.decimals === undefined || !swapPrice.balance?.balance

            if (currencyInfoNotFound || !enableSwapPayments) {
              return null
            }
            const swapQuotePriceFormatted = formatUnits(BigInt(swapPrice.price.price), swapPrice.info?.decimals || 18)
            const swapQuoteAddress = swapPrice.info?.address || ''

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
                price={String(Number(swapQuotePriceFormatted).toPrecision(4))}
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

  const gutterHeight = 8
  const optionHeight = 72
  const displayedOptionsAmount = Math.min(coins.length, 3)
  const displayedGuttersAmount = displayedOptionsAmount - 1
  const viewheight = swapsIsLoading
    ? '174px'
    : `${24 + optionHeight * displayedOptionsAmount + gutterHeight * displayedGuttersAmount}px`

  return (
    <Box width="full">
      <Box>
        <Text variant="small" fontWeight="medium" color="white">
          Pay with crypto
        </Text>
      </Box>
      <Scroll paddingY="3" style={{ height: viewheight, marginBottom: '-12px' }}>
        {isLoadingOptions ? (
          <Box width="full" paddingTop="5" justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        ) : (
          <Options />
        )}
      </Scroll>
    </Box>
  )
}

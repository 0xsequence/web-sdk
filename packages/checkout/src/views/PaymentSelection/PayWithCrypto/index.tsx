import { AddIcon, Box, Button, SubtractIcon, Text, Spinner } from '@0xsequence/design-system'
import {
  CryptoOption,
  useBalancesSummary,
  useContractInfo,
  useSwapPrices,
  compareAddress,
  ContractVerificationStatus,
  formatDisplay
} from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { motion } from 'framer-motion'
import { useState, useEffect, Fragment, SetStateAction } from 'react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'

import { SelectPaymentSettings } from '../../../contexts'
import { useClearCachedBalances } from '../../../hooks'

interface PayWithCryptoProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  selectedCurrency: string | undefined
  setSelectedCurrency: React.Dispatch<SetStateAction<string | undefined>>
  isLoading: boolean
}

const MAX_OPTIONS = 3

export const PayWithCrypto = ({
  settings,
  disableButtons,
  selectedCurrency,
  setSelectedCurrency,
  isLoading
}: PayWithCryptoProps) => {
  const [showMore, setShowMore] = useState(false)
  const { enableSwapPayments = true, enableMainCurrencyPayment = true } = settings

  const { chain, currencyAddress, price } = settings
  const { address: userAddress } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: currencyBalanceData, isLoading: currencyBalanceIsLoading } = useBalancesSummary({
    chainIds: [chainId],
    filter: {
      accountAddresses: userAddress ? [userAddress] : [],
      contractStatus: ContractVerificationStatus.ALL,
      contractWhitelist: [currencyAddress],
      omitNativeBalances: true
    },
    omitMetadata: true
  })

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useContractInfo(chainId, currencyAddress)

  const buyCurrencyAddress = settings?.currencyAddress

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
  const priceDisplay = formatDisplay(priceFormatted, {
    disableScientificNotation: true,
    disableCompactNotation: true,
    significantDigits: 6
  })

  const balanceInfo = currencyBalanceData?.find(balanceData => compareAddress(currencyAddress, balanceData.contractAddress))

  const balance: bigint = BigInt(balanceInfo?.balance || '0')
  // let balanceFormatted = Number(formatUnits(balance, currencyInfoData?.decimals || 0))
  // balanceFormatted = Math.trunc(Number(balanceFormatted) * 10000) / 10000

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
                  price={priceDisplay}
                  disabled={disableButtons}
                  isSelected={compareAddress(selectedCurrency || '', currencyAddress)}
                  isInsufficientFunds={isNotEnoughFunds}
                />
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

            const swapQuotePriceDisplay = formatDisplay(swapQuotePriceFormatted, {
              disableScientificNotation: true,
              disableCompactNotation: true,
              significantDigits: 6
            })

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
                price={swapQuotePriceDisplay}
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
  const displayedOptionsAmount = Math.min(coins.length, MAX_OPTIONS)
  const displayedGuttersAmount = displayedOptionsAmount - 1
  const collapsedOptionsHeight = `${optionHeight * displayedOptionsAmount + gutterHeight * displayedGuttersAmount}px`

  const ShowMoreButton = () => {
    return (
      <Box justifyContent="center" alignItems="center" width="full">
        <Button
          rightIcon={() => {
            if (showMore) {
              return <SubtractIcon style={{ marginLeft: '-4px' }} size="xs" />
            }
            return <AddIcon style={{ marginLeft: '-4px' }} size="xs" />
          }}
          variant="ghost"
          color="white"
          onClick={() => {
            setShowMore(!showMore)
          }}
          label={showMore ? 'Show less' : 'Show more'}
        />
      </Box>
    )
  }

  return (
    <Box width="full">
      <Box>
        <Text variant="small" fontWeight="medium" color="white">
          Pay with crypto
        </Text>
      </Box>
      <Box
        paddingY="3"
        style={{
          marginBottom: '-12px'
        }}
      >
        {isLoadingOptions ? (
          <Box width="full" paddingY="5" justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        ) : (
          <>
            <Box
              as={motion.div}
              animate={{ height: showMore ? 'auto' : collapsedOptionsHeight }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
              overflow="hidden"
            >
              <Options />
            </Box>
            {swapsIsLoading && (
              <Box justifyContent="center" alignItems="center" width="full" marginTop="4">
                <Spinner />
              </Box>
            )}
            {!swapsIsLoading && coins.length > MAX_OPTIONS && <ShowMoreButton />}
          </>
        )}
      </Box>
    </Box>
  )
}

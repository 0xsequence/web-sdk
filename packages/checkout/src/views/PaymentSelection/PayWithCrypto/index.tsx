import { CryptoOption, compareAddress, ContractVerificationStatus, formatDisplay } from '@0xsequence/connect'
import { AddIcon, Button, SubtractIcon, Text, Spinner } from '@0xsequence/design-system'
import { useClearCachedBalances, useGetTokenBalancesSummary, useGetContractInfo, useGetSwapOptions } from '@0xsequence/hooks'
import { findSupportedNetwork } from '@0xsequence/network'
import { motion } from 'motion/react'
import { useState, useEffect, Fragment, SetStateAction, useMemo } from 'react'
import { formatUnits, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { SelectPaymentSettings } from '../../../contexts'

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

  const { chain, currencyAddress, price, skipNativeBalanceCheck } = settings
  const { address: userAddress } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: currencyAddress
  })

  const { data: swapOptions = [], isLoading: swapOptionsIsLoading } = useGetSwapOptions(
    {
      walletAddress: userAddress ?? '',
      chainId,
      toTokenAddress: currencyAddress
    },
    { disabled: !enableSwapPayments || !userAddress }
  )

  const tokenAddressesToFetch = useMemo(() => {
    const addresses = new Set<string>()
    if (enableMainCurrencyPayment && currencyAddress) {
      addresses.add(currencyAddress)
    }
    swapOptions.forEach(option => {
      if (option.address) {
        addresses.add(option.address)
      }
    })
    return Array.from(addresses)
      .filter(addr => !!addr)
      .map(addr => addr.toLowerCase())
  }, [currencyAddress, swapOptions, enableMainCurrencyPayment])

  const balanceHookOptions = useMemo(
    () => ({
      disabled: !userAddress || tokenAddressesToFetch.length === 0
    }),
    [userAddress, tokenAddressesToFetch.length]
  )

  const {
    data: currencyBalanceData,
    isLoading: currencyBalanceIsLoading,
    fetchNextPage: fetchNextCurrencyBalance,
    hasNextPage: hasNextCurrencyBalance,
    isFetchingNextPage: isFetchingNextCurrencyBalance
  } = useGetTokenBalancesSummary(
    {
      chainIds: [chainId],
      filter: {
        accountAddresses: userAddress ? [userAddress] : [],
        contractStatus: ContractVerificationStatus.ALL,
        contractWhitelist: tokenAddressesToFetch,
        omitNativeBalances: skipNativeBalanceCheck ?? false
      },
      omitMetadata: true,
      page: { pageSize: 40 }
    },
    balanceHookOptions
  )

  const balanceMap = useMemo(() => {
    const map = new Map<string, bigint>()
    currencyBalanceData?.pages?.forEach(page => {
      page.balances?.forEach(balanceData => {
        if (balanceData.contractAddress && balanceData.balance) {
          map.set(balanceData.contractAddress.toLowerCase(), BigInt(balanceData.balance))
        }
      })
    })
    return map
  }, [currencyBalanceData])

  useEffect(() => {
    if (hasNextCurrencyBalance && !isFetchingNextCurrencyBalance) {
      fetchNextCurrencyBalance()
    }
  }, [hasNextCurrencyBalance, isFetchingNextCurrencyBalance, fetchNextCurrencyBalance])

  const isLoadingOptions = (currencyBalanceIsLoading && !balanceHookOptions.disabled) || isLoadingCurrencyInfo || isLoading

  const swapsAreLoading = swapOptionsIsLoading && enableSwapPayments

  interface Coin {
    index: number
    name: string
    symbol: string
    currencyAddress: string
  }

  const coins: Coin[] = useMemo(() => {
    const initialCoins = [
      ...(enableMainCurrencyPayment && currencyInfoData && currencyAddress
        ? [
            {
              index: 0,
              name: currencyInfoData.name || 'Unknown',
              symbol: currencyInfoData.symbol || '',
              currencyAddress: currencyAddress
            }
          ]
        : []),
      ...swapOptions.map((tokenOption, index) => {
        return {
          index: enableMainCurrencyPayment && currencyAddress ? index + 1 : index,
          name: tokenOption.name || 'Unknown',
          symbol: tokenOption.symbol || '',
          currencyAddress: tokenOption.address || ''
        }
      })
    ]
    return initialCoins
      .filter(coin => !!coin.currencyAddress)
      .map(coin => ({ ...coin, currencyAddress: coin.currencyAddress.toLowerCase() }))
  }, [enableMainCurrencyPayment, currencyInfoData, swapOptions, currencyAddress])

  useEffect(() => {
    if (selectedCurrency || coins.length === 0 || (currencyBalanceIsLoading && !balanceHookOptions.disabled)) {
      return
    }

    const lowerCaseCurrencyAddress = currencyAddress?.toLowerCase()

    const mainCurrencyBalance = balanceMap.get(lowerCaseCurrencyAddress || '') ?? 0n
    const priceBigInt = BigInt(price || '0')
    const mainCurrencySufficient = priceBigInt <= mainCurrencyBalance

    if (enableMainCurrencyPayment && lowerCaseCurrencyAddress && mainCurrencySufficient) {
      setSelectedCurrency(lowerCaseCurrencyAddress)
    } else {
      const firstSwapCoin = coins.find(c => c.currencyAddress !== lowerCaseCurrencyAddress)
      if (firstSwapCoin) {
        setSelectedCurrency(firstSwapCoin.currencyAddress)
      } else if (enableMainCurrencyPayment && lowerCaseCurrencyAddress) {
        setSelectedCurrency(lowerCaseCurrencyAddress)
      }
    }
  }, [
    coins,
    selectedCurrency,
    enableMainCurrencyPayment,
    currencyAddress,
    price,
    balanceMap,
    setSelectedCurrency,
    currencyBalanceIsLoading,
    balanceHookOptions.disabled
  ])

  const priceDisplay = useMemo(() => {
    const priceBigInt = BigInt(price || '0')
    const decimals = currencyInfoData?.decimals || 0
    if (decimals <= 0) {
      return '0'
    }
    const priceFormatted = formatUnits(priceBigInt, decimals)
    return formatDisplay(priceFormatted, {
      disableScientificNotation: true,
      disableCompactNotation: true,
      significantDigits: 6
    })
  }, [price, currencyInfoData])

  useEffect(() => {
    clearCachedBalances()
  }, [clearCachedBalances])

  console.log(coins, 'coins')

  const Options = () => {
    const lowerSelectedCurrency = selectedCurrency?.toLowerCase()
    const lowerCurrencyAddress = currencyAddress?.toLowerCase()
    const priceBigInt = BigInt(price || '0')

    return (
      <div className="flex flex-col justify-center items-center gap-2 w-full">
        {coins.map(coin => {
          const isMainCurrency = coin.currencyAddress === lowerCurrencyAddress
          const currentBalance = balanceMap.get(coin.currencyAddress) ?? 0n

          if (isMainCurrency) {
            const isNative = compareAddress(coin.currencyAddress, zeroAddress)
            const isNativeBalanceCheckSkipped = isNative && skipNativeBalanceCheck
            const hasInsufficientFunds = priceBigInt > currentBalance

            return (
              <Fragment key={coin.currencyAddress}>
                <CryptoOption
                  currencyName={coin.name}
                  chainId={chainId}
                  iconUrl={currencyInfoData?.logoURI}
                  symbol={coin.symbol}
                  onClick={() => {
                    setSelectedCurrency(coin.currencyAddress)
                  }}
                  price={priceDisplay}
                  disabled={disableButtons}
                  isSelected={lowerSelectedCurrency === coin.currencyAddress}
                  showInsufficientFundsWarning={isNativeBalanceCheckSkipped ? undefined : hasInsufficientFunds}
                />
              </Fragment>
            )
          } else {
            const swapOption = swapOptions?.find(tokenOption => tokenOption.address?.toLowerCase() === coin.currencyAddress)

            if (!swapOption || !enableSwapPayments) {
              return null
            }

            const hasInsufficientFunds = priceBigInt > currentBalance

            const swapQuotePriceDisplay = formatDisplay(swapOption.priceUsd, {
              disableScientificNotation: true,
              disableCompactNotation: true,
              significantDigits: 6
            })

            return (
              <CryptoOption
                key={coin.currencyAddress}
                currencyName={coin.name}
                chainId={chainId}
                iconUrl={swapOption.logoUri}
                symbol={coin.symbol}
                onClick={() => {
                  setSelectedCurrency(coin.currencyAddress)
                }}
                price={swapQuotePriceDisplay}
                disabled={disableButtons}
                isSelected={lowerSelectedCurrency === coin.currencyAddress}
                showInsufficientFundsWarning={hasInsufficientFunds}
              />
            )
          }
        })}
      </div>
    )
  }

  const gutterHeight = 8
  const optionHeight = 72
  const displayedOptionsAmount = Math.min(coins.length, MAX_OPTIONS)
  const displayedGuttersAmount = Math.max(0, displayedOptionsAmount - 1)
  const collapsedOptionsHeight = useMemo(() => {
    return `${optionHeight * displayedOptionsAmount + gutterHeight * displayedGuttersAmount}px`
  }, [coins.length])

  const ShowMoreButton = () => {
    return (
      <div className="flex justify-center items-center w-full">
        <Button
          className="text-white"
          rightIcon={() => {
            if (showMore) {
              return <SubtractIcon style={{ marginLeft: '-4px' }} size="xs" />
            }
            return <AddIcon style={{ marginLeft: '-4px' }} size="xs" />
          }}
          variant="ghost"
          onClick={() => {
            setShowMore(!showMore)
          }}
          label={showMore ? 'Show less' : 'Show more'}
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div>
        <Text variant="small" fontWeight="medium" color="white">
          Pay with crypto
        </Text>
      </div>
      <div
        className="py-3"
        style={{
          marginBottom: '-12px'
        }}
      >
        {isLoadingOptions ? (
          <div className="flex w-full py-5 justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <>
            <motion.div
              className="overflow-hidden"
              animate={{ height: showMore ? 'auto' : collapsedOptionsHeight }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            >
              <Options />
            </motion.div>
            {swapsAreLoading && (
              <div className="flex justify-center items-center w-full mt-4">
                <Spinner />
              </div>
            )}
            {!swapsAreLoading && coins.length > MAX_OPTIONS && <ShowMoreButton />}
          </>
        )}
      </div>
    </div>
  )
}

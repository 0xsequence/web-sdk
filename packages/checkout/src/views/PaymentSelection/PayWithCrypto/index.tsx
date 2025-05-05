import { CryptoOption, compareAddress, ContractVerificationStatus, formatDisplay } from '@0xsequence/connect'
import { AddIcon, Button, SubtractIcon, Text, Spinner } from '@0xsequence/design-system'
import { useClearCachedBalances, useGetTokenBalancesSummary, useGetContractInfo, useGetSwapRoutes } from '@0xsequence/hooks'
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

  const { chain, currencyAddress, price, skipNativeBalanceCheck, nativeTokenAddress } = settings
  const { address: userAddress } = useAccount()
  const { clearCachedBalances } = useClearCachedBalances()
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: currencyInfoData, isLoading: isLoadingCurrencyInfo } = useGetContractInfo({
    chainID: String(chainId),
    contractAddress: currencyAddress
  })

  const { data: swapRoutes = [], isLoading: swapRoutesIsLoading } = useGetSwapRoutes(
    {
      walletAddress: userAddress ?? '',
      chainId,
      toTokenAmount: price,
      toTokenAddress: currencyAddress
    },
    { disabled: !enableSwapPayments || !userAddress }
  )

  const tokenAddressesToFetch = useMemo(() => {
    const addresses = new Set<string>()
    if (enableMainCurrencyPayment && currencyAddress) {
      addresses.add(currencyAddress)
    }
    swapRoutes
      .flatMap(route => route.fromTokens)
      .forEach(fromToken => {
        if (fromToken.address) {
          addresses.add(fromToken.address)
        }
      })
    return Array.from(addresses)
      .filter(addr => !!addr)
      .map(addr => addr.toLowerCase())
  }, [currencyAddress, swapRoutes, enableMainCurrencyPayment])

  const balanceHookOptions = useMemo(
    () => ({
      disabled: !userAddress || tokenAddressesToFetch.length === 0
    }),
    [userAddress, tokenAddressesToFetch.length]
  )

  const {
    data: tokenBalancesData,
    isLoading: tokenBalancesIsLoading,
    fetchNextPage: fetchNextTokenBalances,
    hasNextPage: hasNextTokenBalances,
    isFetchingNextPage: isFetchingNextTokenBalances
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

  const tokenBalancesMap = useMemo(() => {
    const map = new Map<string, bigint>()
    tokenBalancesData?.pages?.forEach(page => {
      page.balances?.forEach(balanceData => {
        if (balanceData.contractAddress && balanceData.balance) {
          map.set(balanceData.contractAddress.toLowerCase(), BigInt(balanceData.balance))
        }
      })
    })
    return map
  }, [tokenBalancesData])

  useEffect(() => {
    if (hasNextTokenBalances && !isFetchingNextTokenBalances) {
      fetchNextTokenBalances()
    }
  }, [hasNextTokenBalances, isFetchingNextTokenBalances, fetchNextTokenBalances])

  const isLoadingOptions = (tokenBalancesIsLoading && !balanceHookOptions.disabled) || isLoadingCurrencyInfo || isLoading
  const swapsAreLoading = swapRoutesIsLoading && enableSwapPayments

  interface TokenPayOption {
    index: number
    name: string
    symbol: string
    currencyAddress: string
    price?: number
    decimals?: number
    logoUri?: string
  }

  const tokenPayOptions: TokenPayOption[] = useMemo(() => {
    const initialCoins = [
      ...(enableMainCurrencyPayment && currencyInfoData && currencyAddress
        ? [
            {
              index: 0,
              name: currencyInfoData.name || 'Unknown',
              symbol: currencyInfoData.symbol || '',
              currencyAddress: currencyAddress,
              price: Number(price),
              decimals: currencyInfoData.decimals,
              logoUri: currencyInfoData.logoURI
            }
          ]
        : []),
      ...swapRoutes
        .flatMap(route => route.fromTokens)
        .map((fromToken, index) => {
          return {
            index: enableMainCurrencyPayment && currencyAddress ? index + 1 : index,
            name: fromToken.name || 'Unknown',
            symbol: fromToken.symbol || '',
            currencyAddress: fromToken.address || '',
            price: Number(fromToken.price || 0),
            decimals: fromToken.decimals || 0,
            logoUri: fromToken.logoUri
          }
        })
    ]
    return initialCoins
      .filter(coin => !!coin.currencyAddress)
      .map(coin => ({ ...coin, currencyAddress: coin.currencyAddress.toLowerCase() }))
  }, [enableMainCurrencyPayment, currencyInfoData, swapRoutes, currencyAddress])

  useEffect(() => {
    if (selectedCurrency || tokenPayOptions.length === 0 || (tokenBalancesIsLoading && !balanceHookOptions.disabled)) {
      return
    }

    const lowerCaseCurrencyAddress = currencyAddress?.toLowerCase()

    const mainCurrencyBalance = tokenBalancesMap.get(lowerCaseCurrencyAddress || '') ?? 0n
    const priceBigInt = BigInt(price || '0')
    const mainCurrencySufficient = priceBigInt <= mainCurrencyBalance

    if (enableMainCurrencyPayment && lowerCaseCurrencyAddress && mainCurrencySufficient) {
      setSelectedCurrency(lowerCaseCurrencyAddress)
    } else {
      const firstSwapCoin = tokenPayOptions.find(c => c.currencyAddress !== lowerCaseCurrencyAddress)
      if (firstSwapCoin) {
        setSelectedCurrency(firstSwapCoin.currencyAddress)
      } else if (enableMainCurrencyPayment && lowerCaseCurrencyAddress) {
        setSelectedCurrency(lowerCaseCurrencyAddress)
      }
    }
  }, [
    tokenPayOptions,
    selectedCurrency,
    enableMainCurrencyPayment,
    currencyAddress,
    price,
    tokenBalancesMap,
    setSelectedCurrency,
    tokenBalancesIsLoading,
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

  const Options = () => {
    const lowerSelectedCurrency = selectedCurrency?.toLowerCase()
    const lowerCurrencyAddress = currencyAddress?.toLowerCase()

    return (
      <div className="flex flex-col justify-center items-center gap-2 w-full">
        {tokenPayOptions.map(swapOption => {
          const isMainCurrency = swapOption.currencyAddress === lowerCurrencyAddress
          const currentBalance = tokenBalancesMap.get(swapOption.currencyAddress) ?? 0n
          const isNative = compareAddress(swapOption.currencyAddress, nativeTokenAddress || zeroAddress)
          const isNativeBalanceCheckSkipped = isNative && skipNativeBalanceCheck

          if (isMainCurrency) {
            const priceBigInt = BigInt(swapOption.price || 0)
            const hasInsufficientFunds = priceBigInt > currentBalance

            return (
              <Fragment key={swapOption.currencyAddress}>
                <CryptoOption
                  currencyName={swapOption.name}
                  chainId={chainId}
                  iconUrl={currencyInfoData?.logoURI}
                  symbol={swapOption.symbol}
                  onClick={() => {
                    setSelectedCurrency(swapOption.currencyAddress)
                  }}
                  price={priceDisplay}
                  disabled={disableButtons}
                  isSelected={lowerSelectedCurrency === swapOption.currencyAddress}
                  showInsufficientFundsWarning={isNativeBalanceCheckSkipped ? undefined : hasInsufficientFunds}
                />
              </Fragment>
            )
          } else {
            if (!swapOption || !enableSwapPayments) {
              return null
            }

            const hasInsufficientFunds = BigInt(swapOption.price || 0) > currentBalance
            const swapQuotePriceDisplay = formatUnits(BigInt(swapOption.price || 0), swapOption.decimals || 18)
            const formattedPrice = formatDisplay(swapQuotePriceDisplay, {
              disableScientificNotation: true,
              disableCompactNotation: true,
              significantDigits: 6
            })

            return (
              <CryptoOption
                key={swapOption.currencyAddress}
                currencyName={swapOption.name}
                chainId={chainId}
                iconUrl={swapOption.logoUri}
                symbol={swapOption.symbol}
                onClick={() => {
                  setSelectedCurrency(swapOption.currencyAddress)
                }}
                price={formattedPrice}
                disabled={disableButtons}
                isSelected={lowerSelectedCurrency === swapOption.currencyAddress}
                showInsufficientFundsWarning={isNativeBalanceCheckSkipped ? undefined : hasInsufficientFunds}
              />
            )
          }
        })}
      </div>
    )
  }

  const gutterHeight = 8
  const optionHeight = 72
  const displayedOptionsAmount = Math.min(tokenPayOptions.length, MAX_OPTIONS)
  const displayedGuttersAmount = Math.max(0, displayedOptionsAmount - 1)
  const collapsedOptionsHeight = useMemo(() => {
    return `${optionHeight * displayedOptionsAmount + gutterHeight * displayedGuttersAmount}px`
  }, [tokenPayOptions.length])

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
            {!swapsAreLoading && tokenPayOptions.length > MAX_OPTIONS && <ShowMoreButton />}
          </>
        )}
      </div>
    </div>
  )
}

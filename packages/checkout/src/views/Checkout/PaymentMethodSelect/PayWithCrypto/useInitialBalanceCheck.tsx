import { compareAddress, ContractVerificationStatus } from '@0xsequence/connect'
import { useGetSwapRoutes, useGetTokenBalancesSummary } from '@0xsequence/hooks'
import { useEffect } from 'react'
import { zeroAddress } from 'viem'

import { type PaymentMethodSelectionParams } from '../../../../contexts/NavigationCheckout.js'
import { useNavigationCheckout } from '../../../../hooks/useNavigationCheckout.js'

interface UseInitialBalanceCheckArgs {
  userAddress: string
  buyCurrencyAddress: string
  price: string
  chainId: number
  isInsufficientBalance: boolean
  tokenBalancesIsLoading: boolean
}

// Hook to check if the user has enough of a balance of the
// initial currency to purchase the item
// If not, a swap route for which he has enough balance will be selected
export const useInitialBalanceCheck = ({
  userAddress,
  buyCurrencyAddress,
  price,
  chainId,
  isInsufficientBalance,
  tokenBalancesIsLoading
}: UseInitialBalanceCheckArgs) => {
  const isFree = BigInt(price) === 0n
  const { navigation, setNavigation } = useNavigationCheckout()

  const isInitialBalanceChecked = (navigation.params as PaymentMethodSelectionParams).isInitialBalanceChecked

  const {
    data: swapRoutes = [],
    isLoading: swapRoutesIsLoading,
    isError: isErrorSwapRoutes
  } = useGetSwapRoutes(
    {
      walletAddress: userAddress ?? '',
      toTokenAddress: buyCurrencyAddress,
      toTokenAmount: price,
      chainId: chainId
    },
    {
      disabled: isInitialBalanceChecked || !isInsufficientBalance || isFree
    }
  )

  const {
    data: swapRoutesTokenBalancesData,
    isLoading: swapRoutesTokenBalancesIsLoading,
    isError: isErrorSwapRoutesTokenBalances
  } = useGetTokenBalancesSummary(
    {
      chainIds: [chainId],
      filter: {
        accountAddresses: userAddress ? [userAddress] : [],
        contractStatus: ContractVerificationStatus.ALL,
        contractWhitelist: swapRoutes
          .flatMap(route => route.fromTokens)
          .map(token => token.address)
          .filter(address => compareAddress(address, zeroAddress)),
        omitNativeBalances: false
      },
      omitMetadata: true
    },
    {
      disabled: isInitialBalanceChecked || !isInsufficientBalance || swapRoutesIsLoading || isFree
    }
  )

  const findSwapQuote = async () => {
    let validSwapRoute: string | undefined

    const route = swapRoutes[0]
    for (let j = 0; j < route.fromTokens.length; j++) {
      const fromToken = route.fromTokens[j]
      const balance = swapRoutesTokenBalancesData?.pages?.[0]?.balances?.find(balance =>
        compareAddress(balance.contractAddress, fromToken.address)
      )

      if (!balance) {
        continue
      }
      if (BigInt(balance.balance || '0') >= BigInt(fromToken.price || '0')) {
        validSwapRoute = fromToken.address
        break
      }
    }

    if (!validSwapRoute) {
      setNavigation({
        location: 'payment-method-selection',
        params: {
          ...navigation.params,
          isInitialBalanceChecked: true
        }
      })

      return
    }

    setNavigation({
      location: 'payment-method-selection',
      params: {
        ...navigation.params,
        selectedCurrency: {
          address: validSwapRoute || buyCurrencyAddress,
          chainId: chainId
        },
        isInitialBalanceChecked: true
      }
    })
  }

  useEffect(() => {
    if (!isInitialBalanceChecked && !tokenBalancesIsLoading && !swapRoutesIsLoading && !swapRoutesTokenBalancesIsLoading) {
      if (isErrorSwapRoutes || isErrorSwapRoutesTokenBalances) {
        setNavigation({
          location: 'payment-method-selection',
          params: {
            ...navigation.params,
            isInitialBalanceChecked: true
          }
        })
      } else if (isInsufficientBalance) {
        findSwapQuote()
      } else {
        setNavigation({
          location: 'payment-method-selection',
          params: {
            ...navigation.params,
            isInitialBalanceChecked: true
          }
        })
      }
    }
  }, [
    isInitialBalanceChecked,
    isInsufficientBalance,
    tokenBalancesIsLoading,
    swapRoutesIsLoading,
    swapRoutesTokenBalancesIsLoading,
    isErrorSwapRoutes,
    isErrorSwapRoutesTokenBalances
  ])
}

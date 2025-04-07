import { SequenceAPIClient, SwapPrice } from '@0xsequence/api'
import { SequenceIndexerGateway } from '@0xsequence/indexer'
import { ContractInfo, SequenceMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'
import { useQuery } from '@tanstack/react-query'

import { NATIVE_TOKEN_ADDRESS_0X_SWAP, QUERY_KEYS, ZERO_ADDRESS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { compareAddress } from '../../utils/helpers'
import { useAPIClient } from '../API/useAPIClient'
import { useIndexerGatewayClient } from '../IndexerGateway/useIndexerGatewayClient'
import { useMetadataClient } from '../Metadata/useMetadataClient'

interface Balance {
  balance: string
}

/**
 * Type representing a swap price with additional currency information
 *
 * @property price - The swap price information from the API
 * @property info - Contract information for the currency, including name, symbol, decimals, etc.
 * @property balance - The user's balance of this currency
 */
export type SwapPricesWithCurrencyInfo = {
  price: SwapPrice
  info: ContractInfo | undefined
  balance: Balance
}

/**
 * Arguments for the useGetSwapPrices hook
 *
 * @property userAddress - The address of the user's wallet
 * @property buyCurrencyAddress - The address of the currency to buy
 * @property buyAmount - The amount of currency to buy (in base units)
 * @property chainId - The chain ID where the swap will occur
 * @property withContractInfo - Whether to fetch additional contract info for each currency
 */
export interface UseGetSwapPricesArgs {
  userAddress: string
  buyCurrencyAddress: string
  buyAmount: string
  chainId: number
  withContractInfo?: boolean
}

const getSwapPrices = async (
  apiClient: SequenceAPIClient,
  metadataClient: SequenceMetadata,
  indexerGatewayClient: SequenceIndexerGateway,
  args: UseGetSwapPricesArgs
): Promise<SwapPricesWithCurrencyInfo[]> => {
  if (!args.chainId || !args.userAddress || !args.buyCurrencyAddress || !args.buyAmount || args.buyAmount === '0') {
    return []
  }

  const network = findSupportedNetwork(args.chainId)

  const { withContractInfo, ...swapPricesArgs } = args

  const res = await apiClient.getSwapPrices(swapPricesArgs)

  if (res.swapPrices === null) {
    return []
  }

  const currencyInfoMap = new Map<string, Promise<ContractInfo | undefined>>()
  if (withContractInfo) {
    res?.swapPrices.forEach(price => {
      const { currencyAddress: rawCurrencyAddress } = price
      const currencyAddress = compareAddress(rawCurrencyAddress, NATIVE_TOKEN_ADDRESS_0X_SWAP) ? ZERO_ADDRESS : rawCurrencyAddress
      const isNativeToken = compareAddress(currencyAddress, ZERO_ADDRESS)
      if (currencyAddress && !currencyInfoMap.has(currencyAddress)) {
        const getNativeTokenInfo = () =>
          new Promise<ContractInfo>(resolve => {
            resolve({
              ...network?.nativeToken,
              logoURI: network?.logoURI || '',
              address: ZERO_ADDRESS
            } as ContractInfo)
          })

        currencyInfoMap.set(
          currencyAddress,
          isNativeToken
            ? getNativeTokenInfo()
            : metadataClient
                .getContractInfo({
                  chainID: String(args.chainId),
                  contractAddress: currencyAddress
                })
                .then(data => ({ ...data.contractInfo }))
                .catch(error => {
                  console.error(`Failed to fetch contract info for ${currencyAddress}:`, error)
                  return undefined
                })
        )
      }
    })
  }

  const currencyBalanceInfoMap = new Map<string, Promise<Balance>>()
  res?.swapPrices.forEach(price => {
    const { currencyAddress: rawCurrencyAddress } = price
    const currencyAddress = compareAddress(rawCurrencyAddress, NATIVE_TOKEN_ADDRESS_0X_SWAP) ? ZERO_ADDRESS : rawCurrencyAddress
    const isNativeToken = compareAddress(currencyAddress, ZERO_ADDRESS)

    if (currencyAddress && !currencyBalanceInfoMap.has(currencyAddress)) {
      const tokenBalance = indexerGatewayClient
        .getTokenBalancesSummary({
          chainIds: [args.chainId],
          filter: {
            accountAddresses: [args.userAddress],
            contractWhitelist: [currencyAddress],
            omitNativeBalances: false
          }
        })
        .then(res => {
          if (isNativeToken) {
            return {
              balance: res.nativeBalances[0].results[0].balance
            }
          } else {
            return {
              balance: res.balances[0].results[0].balance
            }
          }
        })
        .catch(error => {
          console.error(`Failed to fetch balance for ${currencyAddress}:`, error)
          return { balance: '0' }
        })

      currencyBalanceInfoMap.set(currencyAddress, tokenBalance)
    }
  })

  return Promise.all(
    res?.swapPrices.map(async price => {
      const { currencyAddress: rawCurrencyAddress } = price
      const currencyAddress = compareAddress(rawCurrencyAddress, NATIVE_TOKEN_ADDRESS_0X_SWAP) ? ZERO_ADDRESS : rawCurrencyAddress

      return {
        price: {
          ...price,
          currencyAddress
        },
        info: await currencyInfoMap.get(currencyAddress),
        balance: (await currencyBalanceInfoMap.get(currencyAddress)) || { balance: '0' }
      }
    }) || []
  )
}

/**
 * Hook to fetch available swap prices for a given currency pair.
 *
 * This hook provides functionality to:
 * - Get swap prices for a specified currency and amount
 * - Fetch token information and balances for available swap options
 * - Support both native tokens and ERC20 tokens
 * - Handle currency conversions and price formatting
 *
 * The hook automatically handles:
 * - Native token address normalization (between 0x0 and 0xEEE...)
 * - Contract information fetching (name, symbol, decimals, etc.)
 * - Error handling for failed API calls or balance fetches
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useGetSwapPrices} for more detailed documentation.
 *
 * @param args - Configuration object for the swap prices query {@link UseGetSwapPricesArgs}
 * @param options - Optional configuration for the hook behavior {@link HooksOptions}
 *
 * @returns A React Query result object containing:
 * - data: Array of {@link SwapPricesWithCurrencyInfo} objects
 * - isLoading: Whether the query is in progress
 * - isError: Whether an error occurred
 * - error: Any error that occurred
 * - Other standard React Query properties
 *
 * @example
 * ```tsx
 * import { useGetSwapPrices } from '@0xsequence/hooks'
 *
 * function SwapComponent() {
 *   const { data: swapPrices, isLoading } = useGetSwapPrices({
 *     userAddress: '0x123...',
 *     buyCurrencyAddress: '0x456...',
 *     buyAmount: '1000000000000000000', // 1 token in base units
 *     chainId: 1,
 *     withContractInfo: true
 *   })
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       {swapPrices?.map(swap => (
 *         <div key={swap.info?.address}>
 *           Token: {swap.info?.symbol}
 *           Price: {swap.price.price}
 *           Balance: {swap.balance.balance}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useGetSwapPrices = (args: UseGetSwapPricesArgs, options?: HooksOptions) => {
  const apiClient = useAPIClient()
  const metadataClient = useMetadataClient()
  const indexerGatewayClient = useIndexerGatewayClient()

  const enabled =
    !!args.chainId &&
    !!args.userAddress &&
    !!args.buyCurrencyAddress &&
    !!args.buyAmount &&
    args.buyAmount !== '0' &&
    !options?.disabled

  return useQuery({
    queryKey: [QUERY_KEYS.useGetSwapPrices, args, options],
    queryFn: () => getSwapPrices(apiClient, metadataClient, indexerGatewayClient, args),
    retry: options?.retry ?? true,
    // We must keep a long staletime to avoid the list of quotes being refreshed while the user is doing the transactions
    // Instead, we will invalidate the query manually
    staleTime: time.oneHour,
    enabled
  })
}

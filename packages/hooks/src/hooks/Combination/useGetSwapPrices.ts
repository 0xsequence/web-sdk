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

export type SwapPricesWithCurrencyInfo = {
  price: SwapPrice
  info: ContractInfo | undefined
  balance: Balance
}

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
 * @description Gets the Swap Prices for a given currency
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

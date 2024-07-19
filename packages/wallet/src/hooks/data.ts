import { SequenceAPIClient, TokenPrice } from '@0xsequence/api'
import { Transaction, TokenBalance, SequenceIndexer } from '@0xsequence/indexer'
import {
  getTransactionHistory,
  useAPIClient,
  useIndexerClients,
  DisplayedAsset,
  getNativeTokenBalance,
  getTokenBalances,
  getCoinPrices,
  getCollectionBalance,
  useMetadataClient
} from '@0xsequence/kit'
import { GetContractInfoBatchReturn, SequenceMetadata } from '@0xsequence/metadata'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'

import { compareAddress, sampleSize, sortBalancesByType, isTruthy } from '../utils'

export const time = {
  oneSecond: 1 * 1000,
  oneMinute: 60 * 1000,
  oneHour: 60 * 60 * 1000
}

export interface GetBalancesAssetsArgs {
  accountAddress: string
  chainIds: number[]
  displayAssets: DisplayedAsset[]
  verifiedOnly?: boolean
  hideCollectibles?: boolean
}

export const getBalancesAssetsSummary = async (
  apiClient: SequenceAPIClient,
  metadataClient: SequenceMetadata,
  indexerClients: Map<number, SequenceIndexer>,
  { accountAddress, displayAssets, hideCollectibles, verifiedOnly }: GetBalancesAssetsArgs
) => {
  const indexerClientsArr = Array.from(indexerClients.entries())

  const MAX_COLLECTIBLES_AMOUNTS = 10

  let tokenBalances: TokenBalance[] = []

  const customDisplayAssets = displayAssets.length > 0

  try {
    if (customDisplayAssets) {
      const nativeTokens = displayAssets.filter(asset => compareAddress(asset.contractAddress, ethers.constants.AddressZero))
      const otherAssets = displayAssets.filter(asset => !compareAddress(asset.contractAddress, ethers.constants.AddressZero))

      interface AssetsByChainId {
        [chainId: number]: DisplayedAsset[]
      }

      const nativeTokensByChainId: AssetsByChainId = {}
      const otherAssetsByChainId: AssetsByChainId = {}

      nativeTokens.forEach(asset => {
        if (!nativeTokensByChainId[asset.chainId]) {
          nativeTokensByChainId[asset.chainId] = []
        }
        nativeTokensByChainId[asset.chainId].push(asset)
      })

      otherAssets.forEach(asset => {
        if (!otherAssetsByChainId[asset.chainId]) {
          otherAssetsByChainId[asset.chainId] = []
        }
        otherAssetsByChainId[asset.chainId].push(asset)
      })

      tokenBalances = (
        await Promise.all([
          ...Object.keys(nativeTokensByChainId).map(chainId => {
            const indexerClient = indexerClients.get(Number(chainId))

            if (!indexerClient) {
              console.error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
              return null
            }

            return getNativeTokenBalance(indexerClient, Number(chainId), accountAddress)
          }),
          ...Object.keys(otherAssetsByChainId)
            .map(chainId =>
              otherAssetsByChainId[Number(chainId)].map(asset => {
                const indexerClient = indexerClients.get(Number(chainId))

                if (!indexerClient) {
                  console.error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
                  return []
                }

                return getTokenBalances(indexerClient, {
                  accountAddress,
                  contractAddress: asset.contractAddress,
                  includeMetadata: false,
                  hideCollectibles,
                  verifiedOnly
                })
              })
            )
            .flat()
        ])
      )
        .flat()
        .filter(isTruthy)
    } else {
      tokenBalances = (
        await Promise.all([
          ...indexerClientsArr.map(([chainId, indexerClient]) => getNativeTokenBalance(indexerClient, chainId, accountAddress)),
          ...indexerClientsArr.map(([_chainId, indexerClient]) =>
            getTokenBalances(indexerClient, {
              accountAddress,
              hideCollectibles,
              includeMetadata: false,
              verifiedOnly
            })
          )
        ])
      ).flat()
    }

    const { nativeTokens, erc20Tokens, collectibles: collectionBalances } = sortBalancesByType(tokenBalances)

    const fetchPricesPromise: Promise<TokenPrice[]> = new Promise(async resolve => {
      if (erc20Tokens.length > 0) {
        const tokens = erc20Tokens.map(token => ({
          chainId: token.chainId,
          contractAddress: token.contractAddress
        }))
        const prices = (await getCoinPrices(apiClient, tokens)) || []
        resolve(prices)
      } else {
        resolve([])
      }
    })

    const fetchCollectiblesPromises = collectionBalances.map(async collectionBalance => {
      if (customDisplayAssets) {
        return collectionBalance
      }

      const indexerClient = indexerClients.get(collectionBalance.chainId)

      if (!indexerClient) {
        throw new Error(`Indexer client not found for chainId: ${collectionBalance.chainId}, did you forget to add this Chain?`)
      }

      const balance = await getCollectionBalance(indexerClient, {
        accountAddress,
        chainId: collectionBalance.chainId,
        contractAddress: collectionBalance.contractAddress,
        includeMetadata: false
      })

      return balance
    })

    // We need to get metadata for erc20 contracts in order to get decimals and sort by price
    interface ContractInfoMapByChainId {
      [chainId: number]: GetContractInfoBatchReturn
    }

    const fetchErc20ContractInfoPromise = async () => {
      interface Erc20BalanceByChainId {
        [chainId: number]: TokenBalance[]
      }

      const contractInfoMapByChainId: ContractInfoMapByChainId = {}
      const erc20BalanceByChainId: Erc20BalanceByChainId = {}

      erc20Tokens.forEach(erc20Token => {
        if (!erc20BalanceByChainId[erc20Token.chainId]) {
          erc20BalanceByChainId[erc20Token.chainId] = [erc20Token]
        } else {
          erc20BalanceByChainId[erc20Token.chainId].push(erc20Token)
        }
      })

      const contractInfoPromises = Object.keys(erc20BalanceByChainId).map(async chainId => {
        const tokenBalances = erc20BalanceByChainId[Number(chainId)]
        const contractAddresses = tokenBalances.map(balance => balance.contractAddress)
        const result = await metadataClient.getContractInfoBatch({
          chainID: String(chainId),
          contractAddresses
        })
        contractInfoMapByChainId[Number(chainId)] = result
      })
      await Promise.all([...contractInfoPromises])
      return contractInfoMapByChainId
    }

    const [prices, contractInfoMapByChainId, ...collectionCollectibles] = await Promise.all([
      fetchPricesPromise,
      fetchErc20ContractInfoPromise(),
      ...fetchCollectiblesPromises
    ])

    const erc20HighestValue = erc20Tokens.sort((a, b) => {
      const aPriceData = prices.find(price => compareAddress(price.token.contractAddress, a.contractAddress))
      const bPriceData = prices.find(price => compareAddress(price.token.contractAddress, b.contractAddress))

      const aPrice = aPriceData?.price ? aPriceData.price.value : 0
      const bPrice = bPriceData?.price ? bPriceData.price.value : 0

      const aDecimals = contractInfoMapByChainId[a.chainId].contractInfoMap[a.contractAddress]?.decimals
      const bDecimals = contractInfoMapByChainId[b.chainId].contractInfoMap[b.contractAddress]?.decimals

      const aFormattedBalance = aDecimals === undefined ? 0 : Number(ethers.utils.formatUnits(a.balance, aDecimals))
      const bFormattedBalance = bDecimals === undefined ? 0 : Number(ethers.utils.formatUnits(b.balance, bDecimals))

      const aValue = aFormattedBalance * aPrice
      const bValue = bFormattedBalance * bPrice

      return bValue - aValue
    })

    const collectibles: TokenBalance[] = sampleSize(collectionCollectibles.flat(), MAX_COLLECTIBLES_AMOUNTS).sort((a, b) => {
      return a.contractAddress.localeCompare(b.contractAddress)
    })

    if (hideCollectibles) {
      const summaryBalances: TokenBalance[] = [
        ...(nativeTokens.length > 0 ? [nativeTokens[0]] : []),
        // the spots normally occupied by collectibles will be filled by erc20 tokens
        ...(erc20HighestValue.length > 0 ? erc20HighestValue.slice(0, MAX_COLLECTIBLES_AMOUNTS + 1) : [])
      ]

      return summaryBalances
    }

    const summaryBalances: TokenBalance[] = [
      ...(nativeTokens.length > 0 ? [nativeTokens[0]] : []),
      ...(erc20HighestValue.length > 0 ? [erc20HighestValue[0]] : []),
      ...(collectibles.length > 0 ? [...collectibles] : [])
    ]

    return summaryBalances
  } catch (e) {
    console.error(e)
    return []
  }
}

export const useBalancesAssetsSummary = (args: GetBalancesAssetsArgs) => {
  const apiClient = useAPIClient()
  const metadataClient = useMetadataClient()
  const indexerClients = useIndexerClients(args.chainIds)

  return useQuery({
    queryKey: ['balancesAssetsSummary', args],
    queryFn: () => getBalancesAssetsSummary(apiClient, metadataClient, indexerClients, args),
    retry: true,
    refetchInterval: time.oneSecond * 4,
    refetchOnMount: true,
    staleTime: time.oneSecond,
    enabled: args.chainIds.length > 0 && !!args.accountAddress
  })
}

interface GetTransactionHistorySummaryArgs {
  chainIds: number[]
  accountAddress: string
}

const getTransactionHistorySummary = async (
  indexerClients: Map<number, SequenceIndexer>,
  { accountAddress }: GetTransactionHistorySummaryArgs
): Promise<Transaction[]> => {
  const histories = await Promise.all(
    Array.from(indexerClients.values()).map(indexerClient =>
      getTransactionHistory(indexerClient, {
        accountAddress,
        page: {
          page: 1
        }
      })
    )
  )

  const unorderedTransactions = histories.map(history => history.transactions).flat()
  const orderedTransactions = unorderedTransactions.sort((a, b) => {
    const firstDate = new Date(a.timestamp).getTime()
    const secondDate = new Date(b.timestamp).getTime()
    return secondDate - firstDate
  })

  return orderedTransactions
}

export const useTransactionHistorySummary = (args: GetTransactionHistorySummaryArgs) => {
  const indexerClients = useIndexerClients(args.chainIds)

  return useQuery({
    queryKey: ['transactionHistorySummary', args],
    queryFn: () => getTransactionHistorySummary(indexerClients, args),
    retry: true,
    staleTime: time.oneSecond,
    refetchOnMount: true,
    enabled: args.chainIds.length > 0 && !!args.accountAddress
  })
}

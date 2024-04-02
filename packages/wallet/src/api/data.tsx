import { ContractInfo, GetContractInfoArgs, GetContractInfoBatchReturn, TokenMetadata } from '@0xsequence/metadata'
import { Token, TokenPrice } from '@0xsequence/api'
import { TokenBalance, ContractType, Page, GetTransactionHistoryReturn, Transaction } from '@0xsequence/indexer'
import { ethers } from 'ethers'
import { getNetworkConfigAndClients, DisplayedAsset } from '@0xsequence/kit'

import { compareAddress, sortBalancesByType } from '../utils'
import sampleSize from 'lodash/sampleSize'

export interface GetTokenBalancesArgs {
  accountAddress: string
  chainId: number
  contractAddress?: string
}

export const getNativeToken = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const { indexerClient } = getNetworkConfigAndClients(chainId)

    const res = await indexerClient.getEtherBalance({ accountAddress })

    const tokenBalance: TokenBalance = {
      chainId,
      contractAddress: ethers.constants.AddressZero,
      accountAddress,
      balance: res?.balance.balanceWei || '0',
      contractType: ContractType.UNKNOWN,
      blockHash: '',
      blockNumber: 0,
      tokenID: ''
    }
    return [tokenBalance]
  } catch (e) {
    console.error(e)
    return []
  }
}

export interface GetCoinPricesArgs {
  tokens: Token[]
}

export const getCoinPrices = async ({ tokens }: GetCoinPricesArgs) => {
  try {
    if (tokens.length === 0) return []
    const chainId = tokens[0].chainId

    const { apiClient } = await getNetworkConfigAndClients(chainId)

    const res = await apiClient.getCoinPrices({
      tokens
    })

    return res?.tokenPrices || []
  } catch (e) {
    console.error(e)
    return
  }
}

export interface GetTokenBalancesOptions {
  hideUnlistedTokens: boolean
  hideCollectibles?: boolean
  includeMetadata?: boolean
  verifiedOnly?: boolean
}

export const getTokenBalances = async (
  { accountAddress, chainId, contractAddress }: GetTokenBalancesArgs,
  { hideUnlistedTokens, hideCollectibles, includeMetadata = true, verifiedOnly }: GetTokenBalancesOptions
) => {
  try {
    const { indexerClient } = getNetworkConfigAndClients(chainId)

    const res = await indexerClient.getTokenBalances({
      accountAddress,
      includeMetadata,
      metadataOptions: {
        verifiedOnly: verifiedOnly ?? true
      },
      ...(contractAddress ? { contractAddress } : {})
    })

    let returnedBalances = res?.balances || []
    if (hideUnlistedTokens && returnedBalances.length > 0) {
      const coinPrices = await getCoinPrices({
        tokens: returnedBalances.map(balance => ({
          chainId: balance.chainId,
          contractAddress: balance.contractAddress,
          tokenId: balance.tokenID
        }))
      })

      returnedBalances = returnedBalances.filter(balance => {
        const price = coinPrices?.find(
          price => compareAddress(price.token.contractAddress, balance.contractAddress) && price.token.chainId === balance.chainId
        )
        return balance.contractType !== 'ERC20' || (!!price && price.price !== null)
      })
    }

    if (hideCollectibles && returnedBalances.length > 0) {
      returnedBalances = returnedBalances.filter(
        balance => balance.contractType !== 'ERC721' && balance.contractType !== 'ERC1155'
      )
    }

    return returnedBalances
  } catch (e) {
    console.error(e)
    return []
  }
}

export interface FetchBalancesOptions {
  hideUnlistedTokens: boolean
  hideCollectibles?: boolean
}

export const fetchBalances = async (
  { accountAddress, chainId }: GetTokenBalancesArgs,
  { hideUnlistedTokens, hideCollectibles }: FetchBalancesOptions
) => {
  try {
    const tokenBalances = (
      await Promise.all([
        getNativeToken({
          accountAddress,
          chainId
        }),
        getTokenBalances(
          {
            accountAddress,
            chainId
          },
          { hideUnlistedTokens, hideCollectibles }
        )
      ])
    ).flat()
    return tokenBalances
  } catch (e) {
    console.error(e)
    return []
  }
}

export interface GetCollectionBalanceArgs {
  accountAddress: string
  chainId: number
  collectionAddress: string
  includeMetadata?: boolean
  verifiedOnly?: boolean
}

export const fetchCollectionBalance = async ({
  accountAddress,
  chainId,
  collectionAddress,
  includeMetadata = true,
  verifiedOnly
}: GetCollectionBalanceArgs) => {
  try {
    const { indexerClient } = await getNetworkConfigAndClients(chainId)

    const res = await indexerClient.getTokenBalances({
      accountAddress,
      includeMetadata,
      contractAddress: collectionAddress,
      metadataOptions: {
        verifiedOnly: verifiedOnly ?? true
      }
    })

    return res?.balances || []
  } catch (e) {
    console.error(e)
    return []
  }
}
export interface FetchBalancesAssetsArgs {
  accountAddress: string
  chainIds: number[]
  displayAssets: DisplayedAsset[]
}

export interface FetchBalancesAssetsSummaryOptions {
  hideUnlistedTokens: boolean
  hideCollectibles?: boolean
}

export const fetchBalancesAssetsSummary = async (
  { accountAddress, chainIds, displayAssets }: FetchBalancesAssetsArgs,
  { hideUnlistedTokens, hideCollectibles }: FetchBalancesAssetsSummaryOptions
) => {
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
          ...Object.keys(nativeTokensByChainId).map(chainId =>
            getNativeToken({
              accountAddress,
              chainId: Number(chainId)
            })
          ),
          ...Object.keys(otherAssetsByChainId)
            .map(chainId =>
              otherAssetsByChainId[Number(chainId)].map(asset =>
                getTokenBalances(
                  {
                    accountAddress,
                    chainId: Number(chainId),
                    contractAddress: asset.contractAddress
                  },
                  { hideUnlistedTokens, hideCollectibles, includeMetadata: false }
                )
              )
            )
            .flat()
        ])
      ).flat()
    } else {
      tokenBalances = (
        await Promise.all([
          ...chainIds.map(chainId =>
            getNativeToken({
              accountAddress,
              chainId
            })
          ),
          ...chainIds.map(chainId =>
            getTokenBalances(
              {
                accountAddress,
                chainId
              },
              { hideUnlistedTokens, hideCollectibles, includeMetadata: false }
            )
          )
        ])
      ).flat()
    }

    const { nativeTokens, erc20Tokens, collectibles: collectionBalances } = sortBalancesByType(tokenBalances)

    const fetchPricesPromise: Promise<TokenPrice[]> = new Promise(async (resolve, reject) => {
      if (erc20Tokens.length > 0) {
        const tokens = erc20Tokens.map(token => ({
          chainId: token.chainId,
          contractAddress: token.contractAddress
        }))
        const prices = (await getCoinPrices({ tokens })) || []
        resolve(prices)
      } else {
        resolve([])
      }
    })

    const fetchCollectiblesPromises = collectionBalances.map(async collectionBalance => {
      if (customDisplayAssets) {
        return collectionBalance
      }
      const balance = await fetchCollectionBalance({
        accountAddress,
        chainId: collectionBalance.chainId,
        collectionAddress: collectionBalance.contractAddress,
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
        const { metadataClient } = getNetworkConfigAndClients(chainId)
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

export interface GetCollectibleBalanceArgs {
  accountAddress: string
  chainId: number
  collectionAddress: string
  tokenId: string
  verifiedOnly?: boolean
}

export const getCollectibleBalance = async ({
  accountAddress,
  chainId,
  collectionAddress,
  tokenId,
  verifiedOnly
}: GetCollectibleBalanceArgs) => {
  const { indexerClient } = getNetworkConfigAndClients(chainId)

  const res = await indexerClient.getTokenBalances({
    accountAddress,
    includeMetadata: true,
    contractAddress: collectionAddress,
    tokenID: tokenId,
    metadataOptions: {
      verifiedOnly: verifiedOnly ?? true
    }
  })
  const tokenBalance = res.balances[0]

  return tokenBalance
}

export interface GetCollectiblePricesArgs {
  tokens: Token[]
}

export const getCollectiblePrices = async ({ tokens }: GetCollectiblePricesArgs) => {
  try {
    if (tokens.length === 0) return []
    const chainId = tokens[0].chainId

    const { apiClient } = await getNetworkConfigAndClients(chainId)

    const res = await apiClient.getCollectiblePrices({
      tokens
    })

    return res?.tokenPrices || []
  } catch (e) {
    console.error(e)
    return
  }
}

export interface GetTransactionHistoryArgs {
  chainId: number
  accountAddress: string
  contractAddress?: string
  tokenId?: string
  page?: Page
}

export const getTransactionHistory = async ({
  chainId,
  contractAddress,
  accountAddress,
  tokenId,
  page
}: GetTransactionHistoryArgs): Promise<GetTransactionHistoryReturn> => {
  const { indexerClient } = getNetworkConfigAndClients(chainId)

  const response = indexerClient.getTransactionHistory({
    includeMetadata: true,
    page,
    filter: {
      accountAddress,
      contractAddress,
      tokenID: tokenId
    }
  })

  return response
}

export interface GetTransactionHistorySummaryArgs {
  chainIds: number[]
  accountAddress: string
}

export const getTransactionHistorySummary = async ({
  chainIds,
  accountAddress
}: GetTransactionHistorySummaryArgs): Promise<Transaction[]> => {
  const histories = await Promise.all([
    ...chainIds.map(chainId =>
      getTransactionHistory({
        chainId,
        accountAddress,
        page: {
          page: 1
        }
      })
    )
  ])

  const unorderedTransactions = histories.map(history => history.transactions).flat()
  const orderedTransactions = unorderedTransactions.sort((a, b) => {
    const firstDate = new Date(a.timestamp).getTime()
    const secondDate = new Date(b.timestamp).getTime()
    return secondDate - firstDate
  })

  return orderedTransactions
}

export interface FetchFiatConversionRateArgs {
  toCurrency: string
}

export const fetchFiatConversionRate = async ({ toCurrency }: FetchFiatConversionRateArgs) => {
  if (toCurrency === 'USD') {
    return 1
  }

  const { apiClient } = getNetworkConfigAndClients(137)

  const response = await apiClient.getExchangeRate({
    toCurrency
  })

  return response.exchangeRate.value
}

interface Collectibles {
  contractAddress: string
  chainId: number
  tokenIds: string[]
}

export interface FetchTokenMetadataArgs {
  tokens: Collectibles
}

export const fetchTokenMetadata = async ({ tokens }: FetchTokenMetadataArgs): Promise<TokenMetadata[]> => {
  const { metadataClient } = getNetworkConfigAndClients(tokens.chainId)

  const response = await metadataClient.getTokenMetadata({
    chainID: tokens.chainId.toString(),
    contractAddress: tokens.contractAddress,
    tokenIDs: tokens.tokenIds
  })

  return response.tokenMetadata
}

export const getContractInfo = async (args: GetContractInfoArgs): Promise<ContractInfo> => {
  const { metadataClient } = getNetworkConfigAndClients(Number(args.chainID))

  const response = await metadataClient.getContractInfo(args)

  return response.contractInfo
}

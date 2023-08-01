import { Token, TokenPrice } from '@0xsequence/api'
import { TokenBalance, ContractType } from '@0xsequence/indexer'
import { ethers } from 'ethers'

import { compareAddress, sortBalancesByType } from '../utils'
import { getNetworkConfigAndClients } from '../utils/clients'
import sampleSize from 'lodash/sampleSize'

export interface GetTokenBalancesArgs {
  accountAddress: string,
  chainId: number
}

export const getNativeToken = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const { indexerClient } = await getNetworkConfigAndClients(chainId) 

    const res = await indexerClient.getEtherBalance({ accountAddress })
  
    const tokenBalance: TokenBalance = {
      chainId,
      contractAddress: ethers.constants.AddressZero,
      accountAddress,
      balance: res?.balance.balanceWei || '0',
      contractType: ContractType.UNKNOWN,
      blockHash: '',
      blockNumber: 0,
      tokenID: '',
    }
    return [tokenBalance]
  } catch(e) {
    console.error(e)
    return []
  }
}

export const getTokenBalances = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const { indexerClient } = await getNetworkConfigAndClients(chainId) 

    const res = await indexerClient.getTokenBalances({ accountAddress, includeMetadata: true})
  
    return res?.balances || []
  } catch(e) {
    console.error(e)
    return []
  }
}

export const fetchBalances = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {
  try {
    const tokenBalances = (
      await Promise.all([
        getNativeToken({
          accountAddress,
          chainId
        }),
        getTokenBalances({
          accountAddress,
          chainId,
        })
      ])
    ).flat()
    return tokenBalances
  } catch(e) {
    console.error(e)
    return []
  }
}

export interface GetCollectionBalanceArgs {
  accountAddress: string,
  chainId: number,
  collectionAddress: string
}

export const fetchCollectionBalance = async ({ accountAddress, chainId, collectionAddress }: GetCollectionBalanceArgs) => {
  try {
    const { indexerClient } = await getNetworkConfigAndClients(chainId) 

    const res = await indexerClient.getTokenBalances({
      accountAddress,
      includeMetadata: true,
      contractAddress: collectionAddress,
    })
  
    return res?.balances || []
  } catch(e) {
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
  } catch(e) {
    console.error(e)
    return
  }
}

// Will show a condensed view of owned assets
// Only show the highest valued tokens and a sample of the collectibles
export const fetchBalancesAssetsSummary = async ({ accountAddress, chainId }: GetTokenBalancesArgs) => {  
  const MAX_COLLECTIBLES_AMOUNTS = 10
  
  try {
    const tokenBalances = (
      await Promise.all([
        getNativeToken({
          accountAddress,
          chainId
        }),
        getTokenBalances({
          accountAddress,
          chainId,
        })
      ])
    ).flat()

    const { nativeTokens, erc20Tokens, collectibles: collectionBalances } = sortBalancesByType(tokenBalances)

    const fetchPricesPromise: Promise<TokenPrice[]> = new Promise(async (resolve, reject) => {
      if (erc20Tokens.length > 0) {
        const tokens = erc20Tokens.map(token => ({
          chainId: token.chainId,
          contractAddress: token.contractAddress
        }))
        const prices = await getCoinPrices({ tokens }) || []
        resolve(prices)
      } else {
        resolve([]) 
      }
    })

    const fetchCollectiblesPromises = collectionBalances.map(async collectionBalance => {
      const balance = await fetchCollectionBalance({
        accountAddress,
        chainId,
        collectionAddress: collectionBalance.contractAddress
      })

      return balance
    })

    const [prices, ...collectionCollectibles] = await Promise.all([fetchPricesPromise, ...fetchCollectiblesPromises])

    const erc20HighestValue = erc20Tokens.sort((a, b) => {
      const aPriceData = prices.find(price => compareAddress(price.token.contractAddress, a.contractAddress))
      const bPriceData = prices.find(price => compareAddress(price.token.contractAddress, b.contractAddress))
      const aPrice = aPriceData?.price ? aPriceData.price.value : 0
      const bPrice = bPriceData?.price ? bPriceData.price.value : 0

      const aFormattedBalance = Number(ethers.utils.formatUnits(a.balance, a.tokenMetadata?.decimals || 0))
      const bFormattedBalance = Number(ethers.utils.formatUnits(b.balance, b.tokenMetadata?.decimals || 0))      

      const aValue = aFormattedBalance * aPrice
      const bValue = bFormattedBalance * bPrice

      return bValue - aValue
    })

    const collectibles: TokenBalance[] = sampleSize(collectionCollectibles.flat(), MAX_COLLECTIBLES_AMOUNTS).sort(
      (a, b) => {
        return a.contractAddress.localeCompare(b.contractAddress)
      }
    )

    const summaryBalances: TokenBalance[] = [
      ...(nativeTokens.length > 0 ? [nativeTokens[0]] : []),
      ...(erc20HighestValue.length > 0 ? [erc20HighestValue[0]] : []),
      ...(collectibles.length > 0 ? [...collectibles] : [])
    ]

    return summaryBalances
  } catch(e) {
    console.error(e)
    return []
  }
}
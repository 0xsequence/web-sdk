import { Token, TokenPrice } from '@0xsequence/api'
import { getNetworkConfigAndClients } from '@0xsequence/kit'
import { TokenBalance, ContractType } from '@0xsequence/indexer'
import { GetContractInfoArgs, ContractInfo, TokenMetadata } from '@0xsequence/metadata'
import { ethers } from 'ethers'

import { getPaperNetworkName } from '../utils'

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

    const res = await indexerClient.getTokenBalances({
      accountAddress,
      includeMetadata: true,
      metadataOptions: {
        verifiedOnly: true
      }
    })
  
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
      metadataOptions: {
        verifiedOnly: true
      }
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

export const getCoinPrices = async ({ tokens }: GetCoinPricesArgs): Promise<TokenPrice[] | undefined> => {
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

export interface GetTokenMetadataArgs {
  chainId: number
  tokenId: string
  contractAddress: string
}

export const fetchTokenMetadata = async ({
  chainId,
  tokenId,
  contractAddress,
}: GetTokenMetadataArgs): Promise<TokenMetadata> => {
  const { metadataClient } = await getNetworkConfigAndClients(chainId)

  const response = await metadataClient.getTokenMetadata({
    chainID: String(chainId),
    contractAddress,
    tokenIDs: [tokenId],
  })

  return response.tokenMetadata[0]
}

export const fetchContractInfo = async ({
  chainID,
  contractAddress,
}: GetContractInfoArgs): Promise<ContractInfo> => {
  const { metadataClient } = await getNetworkConfigAndClients(chainID)
  
  const response = await metadataClient.getContractInfo({
    chainID,
    contractAddress,
  })

  return response.contractInfo
}

export interface FetchPaperSecretArgs {
  chainId: number,
  email: string,
  abi: string,
  contractAddress: string,
  recipientAddress: string,
  receiptTitle: string,
  collectionContractAddress?: string,
  methodArguments: MethodArguments,
  currency: string,
  currencyAmount: string,
  methodName: string,
}

export interface MethodArguments {
  [key: string]: any
}

export const fetchPaperSecret = async ({
  chainId,
  email,
  contractAddress,
  abi,
  receiptTitle,
  collectionContractAddress,
  methodArguments,
  currency,
  currencyAmount,
  methodName,
  recipientAddress,
}: FetchPaperSecretArgs) => {
  const { network, apiClient } = await getNetworkConfigAndClients(chainId) 

  // @ts-ignore-next-line
  const chainName = getPaperNetworkName(network)

  const paramsJson = JSON.stringify({
    title: receiptTitle,
    email,
    limitPerTransaction: 1,
    quantity: 1,
    mintMethod: {
      args: methodArguments,
      payment: {
        currency,
        value: `${currencyAmount} * $QUANTITY`,
      },
      name: methodName,
    },
    walletAddress: recipientAddress,
    ...(collectionContractAddress ? {
      contractArgs: {
        collectionContractAddress
      }
    } : {}),
  })

  const { secret } = await apiClient.paperSessionSecret2({
   chainName,
   contractAddress,
   abi,
   paramsJson,
  })

  return secret
}
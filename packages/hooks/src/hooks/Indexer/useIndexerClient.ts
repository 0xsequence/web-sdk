import { SequenceIndexer } from '@0xsequence/indexer'
import { ChainId, networks } from '@0xsequence/network'
import { useMemo } from 'react'

import { envString } from '../../utils/envstring'
import { useConfig } from '../useConfig'
import { useNetwork } from '../useNetwork'

export const useIndexerClient = (chainId: ChainId) => {
  const { env, projectAccessKey, jwt } = useConfig()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey, jwt])

  const network = useNetwork(chainId)
  const indexerUrl = envString(env.indexerUrl, 'indexer', network.name)

  if (!indexerClients.has(chainId)) {
    indexerClients.set(chainId, new SequenceIndexer(indexerUrl, projectAccessKey, jwt))
  }

  const indexerClient = indexerClients.get(chainId)

  if (!indexerClient) {
    throw new Error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
  }

  return indexerClient
}

export const useIndexerClients = (chainIds: number[]) => {
  const { env, projectAccessKey, jwt } = useConfig()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey, jwt])

  const result = new Map<ChainId, SequenceIndexer>()

  for (const chainId of chainIds) {
    const network = networks[chainId as ChainId]
    const indexerUrl = envString(env.indexerUrl, 'indexer', network.name)

    if (!indexerClients.has(chainId)) {
      indexerClients.set(chainId, new SequenceIndexer(indexerUrl, projectAccessKey, jwt))
    }

    const indexerClient = indexerClients.get(chainId)

    if (!indexerClient) {
      throw new Error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
    }

    result.set(chainId, indexerClient)
  }

  return result
}

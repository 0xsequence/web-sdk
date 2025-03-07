import { SequenceIndexer } from '@0xsequence/indexer'
import { ChainId, networks } from '@0xsequence/network'
import { useMemo } from 'react'

import { DEBUG } from '../env'

import { useProjectAccessKey } from './useProjectAccessKey'

export const useIndexerClient = (chainId: ChainId) => {
  const projectAccessKey = useProjectAccessKey()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey])

  const network = networks[chainId]
  const clientUrl = DEBUG ? `https://dev-${network.name}-indexer.sequence.app` : `https://${network.name}-indexer.sequence.app`

  if (!indexerClients.has(chainId)) {
    indexerClients.set(chainId, new SequenceIndexer(clientUrl, projectAccessKey))
  }

  const indexerClient = indexerClients.get(chainId)

  if (!indexerClient) {
    throw new Error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
  }

  return indexerClient
}

export const useIndexerClients = (chainIds: ChainId[]) => {
  const projectAccessKey = useProjectAccessKey()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey])

  const result = new Map<ChainId, SequenceIndexer>()

  for (const chainId of chainIds) {
    const network = networks[chainId]
    const clientUrl = DEBUG ? `https://dev-${network.name}-indexer.sequence.app` : `https://${network.name}-indexer.sequence.app`

    if (!indexerClients.has(chainId)) {
      indexerClients.set(chainId, new SequenceIndexer(clientUrl, projectAccessKey))
    }

    const indexerClient = indexerClients.get(chainId)

    if (!indexerClient) {
      throw new Error(`Indexer client not found for chainId: ${chainId}, did you forget to add this Chain?`)
    }

    result.set(chainId, indexerClient)
  }

  return result
}

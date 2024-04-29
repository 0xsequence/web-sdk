import { useMemo } from 'react'
import { useProjectAccessKey } from './useProjectAccessKey'
import { SequenceIndexer } from '@0xsequence/indexer'
import { ChainId, indexerURL, networks } from '@0xsequence/network'

export const useIndexerClient = (chainId: ChainId) => {
  const projectAccessKey = useProjectAccessKey()

  const indexerClients = useMemo(() => {
    return new Map<ChainId, SequenceIndexer>()
  }, [projectAccessKey])

  const network = networks[chainId]

  if (!indexerClients.has(chainId)) {
    indexerClients.set(chainId, new SequenceIndexer(indexerURL(network.name), projectAccessKey))
  }

  const indexerClient = indexerClients.get(chainId)

  if (!indexerClient) {
    throw new Error('Indexer client not found')
  }

  return indexerClient
}

import { SequenceIndexerGateway } from '@0xsequence/indexer'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

export const useIndexerGatewayClient = () => {
  const { projectAccessKey, env } = useConfig()

  const indexerGatewayClient = useMemo(() => {
    const clientUrl = env.indexerGatewayUrl

    return new SequenceIndexerGateway(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return indexerGatewayClient
}

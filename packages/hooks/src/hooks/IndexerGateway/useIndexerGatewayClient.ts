import { SequenceIndexerGateway } from '@0xsequence/indexer'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

export const useIndexerGatewayClient = () => {
  const { env, projectAccessKey, jwt } = useConfig()

  const indexerGatewayClient = useMemo(() => {
    return new SequenceIndexerGateway(env.indexerGatewayUrl, projectAccessKey, jwt)
  }, [projectAccessKey, jwt])

  return indexerGatewayClient
}

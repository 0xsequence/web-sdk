import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

export const useMetadataClient = () => {
  const { env, projectAccessKey, jwt } = useConfig()

  const metadataClient = useMemo(() => {
    return new SequenceMetadata(env.metadataUrl, projectAccessKey)
  }, [projectAccessKey, jwt])

  return metadataClient
}

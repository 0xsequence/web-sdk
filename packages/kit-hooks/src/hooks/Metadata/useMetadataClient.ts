import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

export const useMetadataClient = () => {
  const { projectAccessKey, env } = useConfig()

  const metadataClient = useMemo(() => {
    const clientUrl = env.metadataUrl

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

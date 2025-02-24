import { useMemo } from 'react'

import { useConfig } from './useConfig'

import { SequenceMetadata } from '@0xsequence/metadata'

export const useMetadataClient = () => {
  const { projectAccessKey, env } = useConfig()

  const metadataClient = useMemo(() => {
    const clientUrl = env.metadataUrl

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { useProjectAccessKey } from './useProjectAccessKey'

import { useKitConfig } from '../contexts/KitConfig'

export const useMetadataClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const { isDev = false } = useKitConfig() 

  const metadataClient = useMemo(() => {
    const clientUrl = isDev ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app'

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

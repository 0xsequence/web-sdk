import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { useKitConfig } from '../contexts/KitConfig'

import { useProjectAccessKey } from './useProjectAccessKey'

export const useMetadataClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const metadataClient = useMemo(() => {
    const clientUrl = process.env.DEBUG ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app'

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

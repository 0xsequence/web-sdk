import { useMemo } from 'react'

import { DEBUG } from '../env'
import { useProjectAccessKey } from './useProjectAccessKey'

import { SequenceMetadata } from '@0xsequence/metadata'

export const useMetadataClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const metadataClient = useMemo(() => {
    const clientUrl = DEBUG ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app'

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

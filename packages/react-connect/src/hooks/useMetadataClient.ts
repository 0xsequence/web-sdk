import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { isDevSequenceApis } from '../env'

import { useProjectAccessKey } from './useProjectAccessKey'

export const useMetadataClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const metadataClient = useMemo(() => {
    const clientUrl = isDevSequenceApis() ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app'

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

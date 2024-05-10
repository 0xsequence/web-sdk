import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { useProjectAccessKey } from './useProjectAccessKey'

export const useMetadataClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const metadataClient = useMemo(() => {
    return new SequenceMetadata('https://metadata.sequence.app', projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

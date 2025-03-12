import { SequenceMetadata } from '@0xsequence/metadata'
import { useMemo } from 'react'

import { DEBUG } from '../env'

import { useProjectAccessKey } from './useProjectAccessKey'
import { useEnvironment } from './useEnvironment'

export const useMetadataClient = () => {
  const { isEnabledDevSequenceApis, devProjectAccessKey } = useEnvironment()

  const prodProjectAccessKey = useProjectAccessKey()

  const projectAccessKey = isEnabledDevSequenceApis ? devProjectAccessKey : prodProjectAccessKey

  const metadataClient = useMemo(() => {
    const clientUrl = DEBUG ? 'https://dev-metadata.sequence.app' : 'https://metadata.sequence.app'

    return new SequenceMetadata(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return metadataClient
}

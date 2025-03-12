import { SequenceAPIClient } from '@0xsequence/api'
import { useMemo } from 'react'

import { useProjectAccessKey } from './useProjectAccessKey'
import { useEnvironment } from './useEnvironment'

export const useAPIClient = () => {
  const { isEnabledDevSequenceApis, devProjectAccessKey } = useEnvironment()

  const prodProjectAccessKey = useProjectAccessKey()

  const projectAccessKey = isEnabledDevSequenceApis ? devProjectAccessKey : prodProjectAccessKey

  const clientUrl = isEnabledDevSequenceApis ? 'https://dev-api.sequence.app' : 'https://api.sequence.app'

  const apiClient = useMemo(() => {
    return new SequenceAPIClient(clientUrl, projectAccessKey)
  }, [projectAccessKey, clientUrl])

  return apiClient
}

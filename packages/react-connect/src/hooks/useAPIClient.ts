import { SequenceAPIClient } from '@0xsequence/api'
import { useMemo } from 'react'

import { isDevSequenceApis } from '../env'

import { useProjectAccessKey } from './useProjectAccessKey'

export const useAPIClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const clientUrl = isDevSequenceApis() ? 'https://dev-api.sequence.app' : 'https://api.sequence.app'

  const apiClient = useMemo(() => {
    return new SequenceAPIClient(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return apiClient
}

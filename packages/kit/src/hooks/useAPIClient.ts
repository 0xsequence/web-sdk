import { useMemo } from 'react'

import { DEBUG } from '../env'
import { useProjectAccessKey } from './useProjectAccessKey'

import { SequenceAPIClient } from '@0xsequence/api'

export const useAPIClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const clientUrl = DEBUG ? 'https://dev-api.sequence.app' : 'https://api.sequence.app'

  const apiClient = useMemo(() => {
    return new SequenceAPIClient(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return apiClient
}

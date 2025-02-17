import { SequenceAPIClient } from '@0xsequence/api'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

export const useAPIClient = () => {
  const { projectAccessKey, env } = useConfig()

  const apiClient = useMemo(() => {
    const clientUrl = env.apiUrl

    return new SequenceAPIClient(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return apiClient
}

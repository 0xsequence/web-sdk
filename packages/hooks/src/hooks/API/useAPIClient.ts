import { SequenceAPIClient } from '@0xsequence/api'
import { useMemo } from 'react'

import { useConfig } from '../useConfig'

export const useAPIClient = () => {
  const { projectAccessKey, jwt, env } = useConfig()

  const apiClient = useMemo(() => {
    return new SequenceAPIClient(env.apiUrl, projectAccessKey, jwt)
  }, [projectAccessKey, jwt])

  return apiClient
}

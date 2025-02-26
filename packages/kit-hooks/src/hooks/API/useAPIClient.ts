import { useMemo } from 'react'

import { useConfig } from '../useConfig'

import { SequenceAPIClient } from '@0xsequence/api'

export const useAPIClient = () => {
  const { projectAccessKey, env } = useConfig()

  const apiClient = useMemo(() => {
    const clientUrl = env.apiUrl

    return new SequenceAPIClient(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return apiClient
}

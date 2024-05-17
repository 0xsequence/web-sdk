import { SequenceAPIClient } from '@0xsequence/api'
import { useMemo } from 'react'

import { useProjectAccessKey } from './useProjectAccessKey'
import { useKitConfig } from '../contexts/KitConfig'

export const useAPIClient = () => {
  const projectAccessKey = useProjectAccessKey()
  const { isDev = false } = useKitConfig() 

  const clientUrl = isDev ? 'https://dev-api.sequence.app' : 'https://api.sequence.app'

  const apiClient = useMemo(() => {
    return new SequenceAPIClient(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return apiClient
}

import { SequenceAPIClient } from '@0xsequence/api'
import { useMemo } from 'react'

import { useProjectAccessKey } from './useProjectAccessKey'

export const useAPIClient = () => {
  const projectAccessKey = useProjectAccessKey()

  const apiClient = useMemo(() => {
    return new SequenceAPIClient('https://api.sequence.app', projectAccessKey)
  }, [projectAccessKey])

  return apiClient
}

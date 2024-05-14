import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { useConfig, Storage } from 'wagmi'

import { StorageItem } from '../types'

export const useStorage = (): Storage<StorageItem> | null => {
  const config = useConfig()

  if (!config.storage) {
    return null
  }

  return config.storage as Storage<StorageItem>
}

export const useStorageItem = <K extends keyof StorageItem>(key: K): UseQueryResult<StorageItem[K]> => {
  const storage = useStorage()

  return useQuery({
    queryKey: ['storage', key],
    queryFn: async () => {
      return storage?.getItem(key)
    },
    retry: true,
    enabled: !!storage
  })
}

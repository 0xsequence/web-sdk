import { useConfig } from '@0xsequence/hooks'
import { useQuery } from '@tanstack/react-query'

import { getTransakWidgetUrl, type TransakWidgetUrlArgs } from '../api/data.js'

export const useTransakWidgetUrl = (args: TransakWidgetUrlArgs, disabled?: boolean) => {
  const { env, projectAccessKey } = useConfig()

  const apiUrl = env.apiUrl

  return useQuery({
    queryKey: ['transakWidgetUrl', args],
    queryFn: () => getTransakWidgetUrl(apiUrl, projectAccessKey, args),
    staleTime: 5 * 60 * 1000,
    enabled: !disabled && args.walletAddress !== ''
  })
}

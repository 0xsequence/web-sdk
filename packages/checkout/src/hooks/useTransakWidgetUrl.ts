import { useQuery } from '@tanstack/react-query'
import { getTransakWidgetUrl, type TransakWidgetUrlArgs } from '../api/data.js'
import { useConfig } from '@0xsequence/hooks'

export const useTransakWidgetUrl = (args: TransakWidgetUrlArgs, disabled?: boolean) => {
  const { env, projectAccessKey } = useConfig()
  return useQuery({
    queryKey: ['transakWidgetUrl', args],
    queryFn: () => getTransakWidgetUrl(env.apiUrl, projectAccessKey, args),
    staleTime: 0,
    enabled: !disabled
  })
}

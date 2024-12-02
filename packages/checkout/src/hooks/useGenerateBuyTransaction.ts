import { useQuery } from '@tanstack/react-query'
import { GenerateBuyTransactionArgs } from '@0xsequence/marketplace'
import { useMarketplaceClient } from './useMarketplaceClient'

export interface UseGenerateBuyTransactionOptions {
  disabled?: boolean
}

export const useGenerateBuyTransaction = (args: GenerateBuyTransactionArgs, options?: UseGenerateBuyTransactionOptions) => {
  const marketplaceClient = useMarketplaceClient()
  
  return useQuery({
    queryKey: ['useGenerateBuyTransaction', args],
    queryFn: async () => {
      const res = await marketplaceClient.generateBuyTransaction(args)

      return res
    },
    retry: false,
    staleTime: 360 * 1000,
    enabled: !options?.disabled,
  })
}

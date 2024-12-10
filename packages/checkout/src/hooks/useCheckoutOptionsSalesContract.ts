import { useQuery } from '@tanstack/react-query'
import { CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { useMarketplaceClient } from './useMarketplaceClient'

export interface UseGenerateBuyTransactionOptions {
  disabled?: boolean,
  isDev?: boolean
}

export const useCheckoutOptionsSalesContract = (chain: number | string, args: CheckoutOptionsSalesContractArgs, options?: UseGenerateBuyTransactionOptions) => {
  const marketplaceClient = useMarketplaceClient({ chain, isDev: options?.isDev })
  
  return useQuery({
    queryKey: ['useCheckoutOptionsSalesContract', args],
    queryFn: async () => {
      const res = await marketplaceClient.checkoutOptionsSalesContract(args)

      return res
    },
    retry: false,
    staleTime: 360 * 1000,
    enabled: !options?.disabled && !!args.wallet,
  })
}

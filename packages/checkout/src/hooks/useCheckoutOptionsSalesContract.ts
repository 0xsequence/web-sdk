import { CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { useQuery } from '@tanstack/react-query'

import { useMarketplaceClient } from './useMarketplaceClient'

export interface UseGenerateBuyTransactionOptions {
  disabled?: boolean
}

export const useCheckoutOptionsSalesContract = (
  chain: number | string,
  args: CheckoutOptionsSalesContractArgs,
  options?: UseGenerateBuyTransactionOptions
) => {
  const marketplaceClient = useMarketplaceClient({ chain })

  return useQuery({
    queryKey: ['useCheckoutOptionsSalesContract', args],
    queryFn: async () => {
      const res = await marketplaceClient.checkoutOptionsSalesContract(args)

      return res
    },
    retry: false,
    staleTime: 360 * 1000,
    enabled: !options?.disabled && !!args.wallet
  })
}

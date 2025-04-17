import { useInfiniteQuery } from '@tanstack/react-query'
import { UseInfiniteQueryResult } from '@tanstack/react-query'
import { InfiniteData } from '@tanstack/react-query'

import { TokenBalanceWithPrice } from '../utils'

export const useGetMoreBalances = (
  balances: TokenBalanceWithPrice[],
  pageSize: number,
  options?: { enabled: boolean }
): UseInfiniteQueryResult<InfiniteData<TokenBalanceWithPrice[]>, Error> => {
  return useInfiniteQuery({
    queryKey: ['infiniteBalances', balances],
    queryFn: ({ pageParam }) => {
      const startIndex = pageParam * pageSize
      return balances.slice(startIndex, startIndex + pageSize)
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) {
        return undefined
      }
      return allPages.length
    },
    initialPageParam: 0,
    enabled: !!balances.length && (options?.enabled ?? true)
  })
}

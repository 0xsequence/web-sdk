import type { InfiniteData, QueryKey, UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query'

export type QueryHookOptions<TQueryFnData = unknown, TError = Error, TData = TQueryFnData> = Partial<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>
>

export type InfiniteQueryHookOptions<TQueryFnData = unknown, TError = Error, TPageParam = unknown> = Partial<
  UseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TQueryFnData>, QueryKey, TPageParam>
>

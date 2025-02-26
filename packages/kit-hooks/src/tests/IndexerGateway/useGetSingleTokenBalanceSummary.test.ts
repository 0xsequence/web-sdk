import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS, ZERO_ADDRESS } from '../../constants'
import {
  GetSingleTokenBalanceSummaryArgs,
  useGetSingleTokenBalanceSummary
} from '../../hooks/IndexerGateway/useGetSingleTokenBalanceSummary'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

const getTokenBalancesSummaryArgs: GetSingleTokenBalanceSummaryArgs = {
  chainId: 1,
  accountAddress: ACCOUNT_ADDRESS,
  contractAddress: ZERO_ADDRESS
}

describe('useGetSingleTokenBalanceSummary', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetSingleTokenBalanceSummary(getTokenBalancesSummaryArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data?.balance || 0)

    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetSingleTokenBalanceSummary(getTokenBalancesSummaryArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

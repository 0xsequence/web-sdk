import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS, ZERO_ADDRESS } from '../../constants.js'
import { useGetSingleTokenBalance, type GetSingleTokenBalanceArgs } from '../../hooks/IndexerGateway/useGetSingleTokenBalance.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getTokenBalancesArgs: GetSingleTokenBalanceArgs = {
  chainId: 1,
  accountAddress: ACCOUNT_ADDRESS,
  contractAddress: ZERO_ADDRESS
}

describe('useGetSingleTokenBalance', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetSingleTokenBalance(getTokenBalancesArgs), {
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

    const { result } = renderHook(() => useGetSingleTokenBalance(getTokenBalancesArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

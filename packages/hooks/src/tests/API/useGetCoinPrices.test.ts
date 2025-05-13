import type { Token } from '@0xsequence/api'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { ZERO_ADDRESS } from '../../constants.js'
import { useGetCoinPrices } from '../../hooks/API/useGetCoinPrices.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getCoinPricesArgs: Token[] = [
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS
  }
]

describe('useGetCoinPrices', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetCoinPrices(getCoinPricesArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data?.[0].floorPrice.value || 0)

    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetCoinPrices(getCoinPricesArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

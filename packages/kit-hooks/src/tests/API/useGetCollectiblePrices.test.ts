import { Token } from '@0xsequence/api'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ZERO_ADDRESS } from '../../constants'
import { useGetCollectiblePrices } from '../../hooks/API/useGetCollectiblePrices'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

const getCollectiblePricesArgs: Token[] = [
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS
  }
]

describe('useGetCollectiblePrices', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetCollectiblePrices(getCollectiblePricesArgs), {
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

    const { result } = renderHook(() => useGetCollectiblePrices(getCollectiblePricesArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

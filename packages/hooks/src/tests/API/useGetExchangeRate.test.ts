import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { useGetExchangeRate } from '../../hooks/API/useGetExchangeRate'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

describe('useGetExchangeRate', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetExchangeRate('CAD'), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = result.current.data

    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetExchangeRate('CAD', { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

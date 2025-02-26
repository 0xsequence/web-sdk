import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ZERO_ADDRESS } from '../../constants'
import { GetCurrencyInfoArgs, useGetCurrencyInfo } from '../../hooks/Metadata/useGetCurrencyInfo'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

const getCurrencyInfoArgs: GetCurrencyInfoArgs = {
  chainId: 1,
  currencyAddress: '0x0000000000000000000000000000000000000000'
}

describe('useGetCurrencyInfo', () => {
  it('should return data with name Ether', async () => {
    const { result } = renderHook(() => useGetCurrencyInfo(getCurrencyInfoArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = result.current.data!.name || ''

    expect(value).toBe('Ether')
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetCurrencyInfo(getCurrencyInfoArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    if (getCurrencyInfoArgs.currencyAddress === ZERO_ADDRESS) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    } else {
      await waitFor(() => expect(result.current.isError).toBe(true))
    }
  })
})

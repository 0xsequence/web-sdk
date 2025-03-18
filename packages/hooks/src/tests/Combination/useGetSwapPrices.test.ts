import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS, NATIVE_TOKEN_ADDRESS_0X_SWAP } from '../../constants'
import { useGetSwapPrices } from '../../hooks/Combination/useGetSwapPrices'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

const getSwapPricesArgs = {
  userAddress: ACCOUNT_ADDRESS,
  buyCurrencyAddress: NATIVE_TOKEN_ADDRESS_0X_SWAP,
  chainId: 1,
  buyAmount: '20000',
  withContractInfo: true
}

describe('useGetSwapPrices', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetSwapPrices(getSwapPricesArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data![0].balance.balance || 0)

    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetSwapPrices(getSwapPricesArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

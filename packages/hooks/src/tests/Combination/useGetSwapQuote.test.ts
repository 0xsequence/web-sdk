import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { useGetSwapQuote } from '../../hooks/Combination/useGetSwapQuote'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

// chainId: number;
// walletAddress: string;
// fromTokenAddress: string;
// toTokenAddress: string;
// fromTokenAmount: string;
// toTokenAmount: string;
// includeApprove: boolean;
// slippageBps: number;

const getSwapQuoteArgs = {
  params: {
    walletAddress: ACCOUNT_ADDRESS,
    toTokenAddress: ZERO_ADDRESS,
    fromTokenAddress: ZERO_ADDRESS,
    fromTokenAmount: '20000',
    toTokenAmount: '10000',
    chainId: 1,
    includeApprove: true,
    slippageBps: 100
  }
}

describe('useGetSwapQuoteV2', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetSwapQuote(getSwapQuoteArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data!.currencyBalance || 0)

    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetSwapQuote(getSwapQuoteArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

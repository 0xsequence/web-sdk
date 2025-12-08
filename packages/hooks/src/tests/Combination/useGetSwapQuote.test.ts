import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS, ZERO_ADDRESS } from '../../constants.js'
import { useGetSwapQuote } from '../../hooks/Combination/useGetSwapQuote.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const swapQuoteArgs = {
  params: {
    walletAddress: ACCOUNT_ADDRESS,
    toTokenAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    fromTokenAddress: ZERO_ADDRESS,
    toTokenAmount: '10000',
    chainId: 137,
    includeApprove: true,
    slippageBps: 150
  }
}

describe('useGetSwapQuote', () => {
  it('should return data with a balance', async () => {
    server.use(
      http.post('*/getLifiSwapQuote', async () => {
        return HttpResponse.json(
          {
            quote: {
              currencyAddress: ZERO_ADDRESS,
              currencyBalance: '180000000000000',
              price: '7351402238115',
              maxPrice: '7718972350021',
              to: '0x0000000000000000000000000000000000000000',
              transactionData: '0x0000000000000000000000000000000000000000000000000000000000000000',
              transactionValue: '0',
              approveData: '0x0000000000000000000000000000000000000000000000000000000000000000',
              amount: '10000000000000000',
              amountMin: '9500000000000000'
            }
          },
          { status: 200 }
        )
      })
    )

    const { result } = renderHook(() => useGetSwapQuote({ params: swapQuoteArgs.params }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 3000 })

    expect(result.current.data).toBeDefined()
    const value = BigInt(result.current.data!.currencyBalance || 0)
    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*/getLifiSwapQuote', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetSwapQuote({ params: swapQuoteArgs.params }, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 })
  })
})

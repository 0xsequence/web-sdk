import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS } from '../../constants.js'
import {
  useGetTransactionHistorySummary,
  type GetTransactionHistorySummaryArgs
} from '../../hooks/Indexer/useGetTransactionHistorySummary.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getTransactionHistorySummaryArgs: GetTransactionHistorySummaryArgs = {
  accountAddresses: [ACCOUNT_ADDRESS],
  chainIds: [1]
}

describe('useGetTransactionHistorySummary', () => {
  it('should return data with a transaction', async () => {
    const { result } = renderHook(() => useGetTransactionHistorySummary(getTransactionHistorySummaryArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data![0].txnHash || '')

    expect(value).toBeDefined()
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetTransactionHistorySummary(getTransactionHistorySummaryArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

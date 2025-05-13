import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS, ZERO_ADDRESS } from '../../constants.js'
import { useGetTransactionHistory, type UseGetTransactionHistoryArgs } from '../../hooks/Indexer/useGetTransactionHistory.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getTransactionHistoryArgs: UseGetTransactionHistoryArgs = {
  chainId: 1,
  accountAddresses: [ACCOUNT_ADDRESS],
  contractAddresses: [ZERO_ADDRESS]
}

describe('useGetTransactionHistory', () => {
  it('should return data with a transaction', async () => {
    const { result } = renderHook(() => useGetTransactionHistory(getTransactionHistoryArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data?.pages[0].transactions[0].txnHash || '')

    expect(value).toBeDefined()
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetTransactionHistory(getTransactionHistoryArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

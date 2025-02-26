import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS } from '../../constants'
import { UseGetTransactionHistoryArgs, useGetTransactionHistory } from '../../hooks/Indexer/useGetTransactionHistory'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

const getTransactionHistoryArgs: UseGetTransactionHistoryArgs = {
  chainId: 1,
  accountAddress: ACCOUNT_ADDRESS,
  contractAddress: '0x0000000000000000000000000000000000000000'
}

describe('useGetTransactionHistory', () => {
  it('should return data with a transaction', async () => {
    const { result } = renderHook(() => useGetTransactionHistory(getTransactionHistoryArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data!.pages[0].transactions[0].txnHash || '')

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

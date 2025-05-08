import { IndexerGateway } from '@0xsequence/indexer'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS } from '../../constants.js'
import { useGetTokenBalancesSummary } from '../../hooks/IndexerGateway/useGetTokenBalancesSummary.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getTokenBalancesSummaryArgs: IndexerGateway.GetTokenBalancesSummaryArgs = {
  filter: {
    accountAddresses: [ACCOUNT_ADDRESS],
    contractStatus: IndexerGateway.ContractVerificationStatus.ALL,
    omitNativeBalances: false
  }
}

describe('useGetTokenBalancesSummary', () => {
  it('should return data with a balance', async () => {
    const { result } = renderHook(() => useGetTokenBalancesSummary(getTokenBalancesSummaryArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = BigInt(result.current.data?.pages[0].balances[0].balance || 0)

    expect(value).toBeGreaterThan(0)
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetTokenBalancesSummary(getTokenBalancesSummaryArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

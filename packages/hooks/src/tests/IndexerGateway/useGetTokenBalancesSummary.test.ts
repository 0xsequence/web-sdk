import { IndexerGateway } from '@0xsequence/indexer'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_ADDRESS } from '../../constants'
import { useGetTokenBalancesSummary } from '../../hooks/IndexerGateway/useGetTokenBalancesSummary'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

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

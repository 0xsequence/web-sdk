import type { GetContractInfoArgs } from '@0xsequence/metadata'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { useGetMultipleContractsInfo } from '../../hooks/Metadata/useGetMultipleContractsInfo.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getMultipleContractsInfoArgs: GetContractInfoArgs[] = [
  {
    chainID: '1',
    contractAddress: '0x0000000000000000000000000000000000000000'
  },
  {
    chainID: '1',
    contractAddress: '0x0000000000000000000000000000000000000001'
  }
]

describe('useGetMultipleContractsInfo', () => {
  it('should return data with name Ether', async () => {
    const { result } = renderHook(() => useGetMultipleContractsInfo(getMultipleContractsInfoArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = result.current.data![0].name || ''

    expect(value).toBe('Ether')
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetMultipleContractsInfo(getMultipleContractsInfoArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

import { GetContractInfoArgs } from '@0xsequence/metadata'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { useGetContractInfo } from '../../hooks/Metadata/useGetContractInfo'
import { createWrapper } from '../createWrapper'
import { server } from '../setup'

const getContractInfoArgs: GetContractInfoArgs = {
  chainID: '1',
  contractAddress: '0x0000000000000000000000000000000000000000'
}

describe('useGetContractInfo', () => {
  it('should return data with name Ether', async () => {
    const { result } = renderHook(() => useGetContractInfo(getContractInfoArgs), {
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

    const { result } = renderHook(() => useGetContractInfo(getContractInfoArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

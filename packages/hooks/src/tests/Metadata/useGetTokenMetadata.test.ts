import type { GetTokenMetadataArgs } from '@0xsequence/metadata'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { useGetTokenMetadata } from '../../hooks/Metadata/useGetTokenMetadata.js'
import { createWrapper } from '../createWrapper.js'
import { server } from '../setup.js'

const getTokenMetadataArgs: GetTokenMetadataArgs = {
  chainID: '1',
  contractAddress: '0x0000000000000000000000000000000000000000',
  tokenIDs: ['1']
}

describe('useGetTokenMetadata', () => {
  it('should return data with a name', async () => {
    const { result } = renderHook(() => useGetTokenMetadata(getTokenMetadataArgs), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()

    const value = result.current.data![0].name || ''

    expect(value).toBe('Test')
  })

  it('should return error when fetching data fails', async () => {
    server.use(
      http.post('*', () => {
        return HttpResponse.error()
      })
    )

    const { result } = renderHook(() => useGetTokenMetadata(getTokenMetadataArgs, { retry: false }), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

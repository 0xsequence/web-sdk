import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { useGetCollectionsMetadata } from '../hooks/useGetCollectionsMetadata'
import { createWrapper } from './createWrapper'
import { server } from './setup'

import { GetContractInfoArgs } from '@0xsequence/metadata'

const getCollectionsMetadataArgs: GetContractInfoArgs[] = [
  {
    chainID: '1',
    contractAddress: '0x0000000000000000000000000000000000000000'
  },
  {
    chainID: '1',
    contractAddress: '0x0000000000000000000000000000000000000001'
  }
]

describe('useGetCollectionsMetadata', () => {
  it('should return data with name Ether', async () => {
    const { result } = renderHook(() => useGetCollectionsMetadata(getCollectionsMetadataArgs), {
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

    const { result } = renderHook(
      () => useGetCollectionsMetadata(getCollectionsMetadataArgs, { retry: false }),
      {
        wrapper: createWrapper()
      }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

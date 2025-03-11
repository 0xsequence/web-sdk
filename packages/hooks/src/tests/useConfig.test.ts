import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useConfig } from '../hooks/useConfig'

import { createWrapper } from './createWrapper'

describe('useConfig', async () => {
  it('should contain projectAccessKey', async () => {
    const { result } = renderHook(() => useConfig(), {
      wrapper: createWrapper()
    })

    expect(result.current.projectAccessKey).toBe('test-access')
  })
})

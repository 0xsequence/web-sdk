import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useConfig } from '../hooks/useConfig.js'

import { createWrapper } from './createWrapper.js'

describe('useConfig', async () => {
  it('should contain projectAccessKey', async () => {
    const { result } = renderHook(() => useConfig(), {
      wrapper: createWrapper()
    })

    expect(result.current.projectAccessKey).toBe('test-access')
  })
})

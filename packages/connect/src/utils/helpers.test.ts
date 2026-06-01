import { describe, expect, it } from 'vitest'

import { normalizeChainId } from './helpers'

describe('normalizeChainId', () => {
  it('normalizes supported chain id values', () => {
    expect(normalizeChainId(1)).toBe(1)
    expect(normalizeChainId(1n)).toBe(1)
    expect(normalizeChainId('1')).toBe(1)
    expect(normalizeChainId('0x1')).toBe(1)
    expect(normalizeChainId({ chainId: '0x2105' })).toBe(8453)
  })

  it('rejects invalid chain id values', () => {
    expect(() => normalizeChainId('1abc')).toThrow('Invalid chain id')
    expect(() => normalizeChainId('abc')).toThrow('Invalid chain id')
    expect(() => normalizeChainId('0x')).toThrow('Invalid chain id')
    expect(() => normalizeChainId(Number.NaN)).toThrow('Invalid chain id')
    expect(() => normalizeChainId(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow('Invalid chain id')
  })
})

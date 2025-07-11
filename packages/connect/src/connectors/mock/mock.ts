import type { Wallet } from '@0xsequence/common'

import { mock as mockBase, type MockParameters } from 'wagmi/connectors'

import { SequenceLogo } from '../sequence/SequenceLogo.js'

export const mock = (options: MockParameters): Wallet => ({
  id: 'mock',
  isSequenceBased: true,
  logoDark: SequenceLogo,
  logoLight: SequenceLogo,
  // iconBackground: '#777',
  name: 'Mock',
  type: 'wallet',
  createConnector: () => {
    const connector = mockBase(options)
    return connector
  }
})

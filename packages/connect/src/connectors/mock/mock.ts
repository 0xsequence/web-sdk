import { mock as mockBase, MockParameters } from 'wagmi/connectors'

import { Wallet } from '../../types'
import { SequenceLogo } from '../sequence/SequenceLogo'

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

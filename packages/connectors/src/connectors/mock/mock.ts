import { CreateConnectorFn } from 'wagmi'
import { mock as mockBase, MockParameters } from 'wagmi/connectors'

import { SequenceLogo } from '../sequence/SequenceLogo'

export const mock = (options: MockParameters) => ({
  id: 'mock',
  isSequenceBased: true,
  logoDark: SequenceLogo,
  logoLight: SequenceLogo,
  // iconBackground: '#777',
  name: 'Mock',
  createConnector: (() => {
    const connector = mockBase(options)
    return connector
  }) as () => CreateConnectorFn
})

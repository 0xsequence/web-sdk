import { CreateConnectorFn } from 'wagmi'

import { SequenceLogo } from './SequenceLogo'
import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

export type SequenceWaasOptions = BaseSequenceWaasConnectorOptions

export const sequenceWaas = (options: SequenceWaasOptions) => ({
  id: 'sequence-waas',
  isSequenceBased: true,
  logoDark: SequenceLogo,
  logoLight: SequenceLogo,
  // iconBackground: '#777',
  name: 'SequenceWaaS',
  createConnector: (() => {
    const connector = sequenceWaasWallet({
      ...options
    })
    return connector
  }) as () => CreateConnectorFn
})

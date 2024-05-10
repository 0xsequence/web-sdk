import type { Wallet } from '@0xsequence/kit'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

import { SequenceLogo } from './SequenceLogo'

export interface SequenceOptions extends BaseSequenceConnectorOptions {}

export const sequence = (options: SequenceOptions): Wallet => ({
  id: 'sequence',
  isSequenceBased: true,
  logoDark: SequenceLogo,
  logoLight: SequenceLogo,
  // iconBackground: '#777',
  name: 'Sequence',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
        ...options.connect
      }
    })
    return connector
  }
})

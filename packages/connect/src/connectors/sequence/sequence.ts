import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { SequenceLogo } from './SequenceLogo.js'

export interface SequenceOptions extends BaseSequenceConnectorOptions {}

export const sequence = (options: SequenceOptions): Wallet => ({
  id: 'sequence',
  isSequenceBased: true,
  logoDark: SequenceLogo,
  logoLight: SequenceLogo,
  // iconBackground: '#777',
  name: 'Sequence',
  type: 'wallet',
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

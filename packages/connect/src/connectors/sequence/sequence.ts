import { Wallet } from '../../types'
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

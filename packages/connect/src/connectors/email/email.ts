import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { getEmailLogo } from './EmailLogo.js'

export interface EmailOptions extends BaseSequenceConnectorOptions {}

export const email = (options: EmailOptions): Wallet => ({
  id: 'email',
  isSequenceBased: true,
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Email',
  type: 'social',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInOptions: ['email']
        }
      }
    })

    return connector
  }
})

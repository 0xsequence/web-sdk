import { getEmailLogo } from './EmailLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'
import { Wallet } from '@0xsequence/kit'

export interface EmailOptions extends BaseSequenceConnectorOptions {}

export const email = (options: EmailOptions): Wallet => ({
  id: 'email',
  isSequenceBased: true,
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Email',
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

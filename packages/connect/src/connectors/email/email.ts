import { Wallet } from '../../types'
import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

import { getEmailLogo } from './EmailLogo'

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

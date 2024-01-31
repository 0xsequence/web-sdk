import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors';
import type { Wallet } from '@0xsequence/kit'

import { getEmailLogo } from './EmailLogo'

export const EMAIL_CONNECTOR_LOCAL_STORAGE_KEY = '@sequence.kit.connector.email'

export interface EmailOptions extends BaseSequenceConnectorOptions {
}

export const email = (options: EmailOptions) => ({
  id: 'email',
  isSequenceBased: true,
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Email',
  createConnector: () => {
    const email = localStorage.getItem(EMAIL_CONNECTOR_LOCAL_STORAGE_KEY)

    const connector = sequenceWallet({
      ...options,
      // @ts-ignore
      connect: {
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInOptions: ['email'],
          signInWithEmail: email || ''
        }
      }
    });

    return connector
  }
}) as Wallet
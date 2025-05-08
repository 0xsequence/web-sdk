import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { getMonochromeGoogleLogo, GoogleLogo } from './GoogleLogo.js'

export type GoogleOptions = BaseSequenceConnectorOptions

export const google = (options: GoogleOptions): Wallet => ({
  id: 'google',
  isSequenceBased: true,
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  name: 'Google',
  type: 'social',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInWith: 'google'
        }
      }
    })
    return connector
  }
})

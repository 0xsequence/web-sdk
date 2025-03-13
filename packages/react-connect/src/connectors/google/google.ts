import { Wallet } from '../../types'
import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

import { GoogleLogo, getMonochromeGoogleLogo } from './GoogleLogo'

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

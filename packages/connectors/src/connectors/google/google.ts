import { GoogleLogo, getMonochromeGoogleLogo } from './GoogleLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'
import { Wallet } from '@0xsequence/kit'

export type GoogleOptions = BaseSequenceConnectorOptions

export const google = (options: GoogleOptions): Wallet => ({
  id: 'google',
  isSequenceBased: true,
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  name: 'Google',
  createConnector: () => {
    const connector = sequenceWallet({
      ...options,
      // @ts-ignore
      connect: {
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

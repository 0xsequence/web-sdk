import { CreateConnectorFn } from 'wagmi'

import { GoogleLogo, getMonochromeGoogleLogo } from './GoogleLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

export interface GoogleOptions extends BaseSequenceConnectorOptions {}

export const google = (options: GoogleOptions) => ({
  id: 'google',
  isSequenceBased: true,
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Google',
  createConnector: (() => {
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
  }) as () => CreateConnectorFn
})

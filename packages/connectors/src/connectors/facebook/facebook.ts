import type { Wallet } from '@0xsequence/kit'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

import { FacebookLogo, getFacebookMonochromeLogo } from './FacebookLogo'


export interface FacebookOptions extends BaseSequenceConnectorOptions {}

export const facebook = (options: FacebookOptions): Wallet => ({
  id: 'facebook',
  isSequenceBased: true,
  logoDark: FacebookLogo,
  logoLight: FacebookLogo,
  monochromeLogoDark: getFacebookMonochromeLogo({ isDarkMode: true }),
  monochromeLogoLight: getFacebookMonochromeLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Facebook',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInWith: 'facebook'
        }
      }
    })
    return connector
  }
})

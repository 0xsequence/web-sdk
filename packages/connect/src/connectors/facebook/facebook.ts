import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { FacebookLogo, getFacebookMonochromeLogo } from './FacebookLogo.js'

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
  type: 'social',
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

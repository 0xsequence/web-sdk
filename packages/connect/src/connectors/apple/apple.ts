import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { getAppleLogo, getAppleMonochromeLogo } from './AppleLogo.js'

export type AppleOptions = BaseSequenceConnectorOptions

export const apple = (options: AppleOptions): Wallet => ({
  id: 'apple',
  isSequenceBased: true,
  logoDark: getAppleLogo({ isDarkMode: true }),
  logoLight: getAppleLogo({ isDarkMode: false }),
  monochromeLogoDark: getAppleMonochromeLogo({ isDarkMode: true }),
  monochromeLogoLight: getAppleMonochromeLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Apple',
  type: 'social',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInWith: 'apple'
        }
      }
    })
    return connector
  }
})

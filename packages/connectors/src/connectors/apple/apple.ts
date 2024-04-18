import type { Wallet } from '@0xsequence/kit'
import { getAppleLogo, getAppleMonochromeLogo } from './AppleLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

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
  createConnector: () => {
    const connector = sequenceWallet({
      ...options,
      connect: {
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

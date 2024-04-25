import { getDiscordLogo } from './DiscordLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'
import { Wallet } from '@0xsequence/kit'

export interface DiscordOptions extends BaseSequenceConnectorOptions {}

export const discord = (options: DiscordOptions): Wallet => ({
  id: 'discord',
  isSequenceBased: true,
  logoDark: getDiscordLogo({ isDarkMode: true }),
  logoLight: getDiscordLogo({ isDarkMode: false }),
  monochromeLogoDark: getDiscordLogo({ isDarkMode: true }),
  monochromeLogoLight: getDiscordLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Discord',
  createConnector: () => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInWith: 'discord'
        }
      }
    })
    return connector
  }
})

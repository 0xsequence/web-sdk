import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { getDiscordLogo } from './DiscordLogo.js'

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
  type: 'social',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
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

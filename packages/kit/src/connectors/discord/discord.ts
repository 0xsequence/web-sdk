import { Wallet } from '../../types'
import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

import { getDiscordLogo } from './DiscordLogo'

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

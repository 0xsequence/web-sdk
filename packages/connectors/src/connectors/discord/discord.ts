import { CreateConnectorFn } from 'wagmi'

import { getDiscordLogo } from './DiscordLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

export interface DiscordOptions extends BaseSequenceConnectorOptions {}

export const discord = (options: DiscordOptions) => ({
  id: 'discord',
  isSequenceBased: true,
  logoDark: getDiscordLogo({ isDarkMode: true }),
  logoLight: getDiscordLogo({ isDarkMode: false }),
  monochromeLogoDark: getDiscordLogo({ isDarkMode: true }),
  monochromeLogoLight: getDiscordLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Discord',
  createConnector: (() => {
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
  }) as () => CreateConnectorFn
})

import type { Wallet } from '../../types.js'
import { sequenceWallet, type BaseSequenceConnectorOptions } from '../wagmiConnectors/index.js'

import { getTwitchLogo } from './TwitchLogo.js'

export interface TwitchOptions extends BaseSequenceConnectorOptions {}

export const twitch = (options: TwitchOptions): Wallet => ({
  id: 'twitch',
  isSequenceBased: true,
  logoDark: getTwitchLogo({}),
  logoLight: getTwitchLogo({}),
  monochromeLogoDark: getTwitchLogo({ isDarkMode: true }),
  monochromeLogoLight: getTwitchLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Twitch',
  type: 'social',
  createConnector: projectAccessKey => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        projectAccessKey,
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInWith: 'twitch'
        }
      }
    })
    return connector
  }
})

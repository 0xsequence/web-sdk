import { Wallet } from '@0xsequence/kit'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

import { getTwitchLogo } from './TwitchLogo'


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

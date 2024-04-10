import { CreateConnectorFn } from 'wagmi'
import type { Wallet } from '@0xsequence/kit'

import { FacebookLogo, getFacebookMonochromeLogo } from './FacebookLogo'

import { sequenceWallet, BaseSequenceConnectorOptions } from '../wagmiConnectors'

export interface FacebookOptions extends BaseSequenceConnectorOptions {}

export const facebook = (options: FacebookOptions) => ({
  id: 'facebook',
  isSequenceBased: true,
  logoDark: FacebookLogo,
  logoLight: FacebookLogo,
  monochromeLogoDark: getFacebookMonochromeLogo({ isDarkMode: true }),
  monochromeLogoLight: getFacebookMonochromeLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Facebook',
  createConnector: (() => {
    const connector = sequenceWallet({
      ...options,
      connect: {
        ...options?.connect,
        settings: {
          ...options?.connect?.settings,
          signInWith: 'facebook'
        }
      }
    })
    return connector
  }) as () => CreateConnectorFn
})

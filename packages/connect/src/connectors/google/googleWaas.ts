import type { Wallet } from '@0xsequence/web-sdk-core'

import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector.js'

import { getMonochromeGoogleLogo, GoogleLogo } from './GoogleLogo.js'

export type GoogleWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const googleWaas = (options: GoogleWaasOptions): Wallet => ({
  id: 'google-waas',
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  name: 'Google',
  type: 'social',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'google'
    })
    return connector
  }
})

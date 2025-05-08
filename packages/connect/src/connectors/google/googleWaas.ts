import type { Wallet } from '../../types'
import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

import { getMonochromeGoogleLogo, GoogleLogo } from './GoogleLogo'

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

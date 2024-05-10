import { Wallet } from '@0xsequence/kit'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

import { GoogleLogo, getMonochromeGoogleLogo } from './GoogleLogo'


export type GoogleWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const googleWaas = (options: GoogleWaasOptions): Wallet => ({
  id: 'google-waas',
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  name: 'Google',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'google'
    })
    return connector
  }
})

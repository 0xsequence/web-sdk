import { CreateConnectorFn } from 'wagmi'

import { GoogleLogo, getMonochromeGoogleLogo } from './GoogleLogo'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

export type GoogleWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const googleWaas = (options: GoogleWaasOptions) => ({
  id: 'google-waas',
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  name: 'Google',
  createConnector: (() => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'google'
    })
    return connector
  }) as () => CreateConnectorFn
})

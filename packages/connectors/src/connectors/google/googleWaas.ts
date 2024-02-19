import { CreateConnectorFn } from 'wagmi'

import { GoogleLogo, getMonochromeGoogleLogo } from './GoogleLogo'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

export type GoogleWaasOptions = BaseSequenceWaasConnectorOptions

export const googleWaas = (options: GoogleWaasOptions) => ({
  id: 'google-waas',
  isSequenceBased: true,
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  // iconBackground: '#fff',
  name: 'Google',
  createConnector: (() => {
    const connector = sequenceWaasWallet({
      ...options
    })
    return connector
  }) as () => CreateConnectorFn
})

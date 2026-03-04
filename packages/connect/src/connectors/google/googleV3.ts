import type { Wallet } from '../../types.js'
import { sequenceV3Wallet, type BaseSequenceV3ConnectorOptions } from '../wagmiConnectors/sequenceV3Connector.js'

import { getMonochromeGoogleLogo, GoogleLogo } from './GoogleLogo.js'

export type GoogleV3Options = Omit<BaseSequenceV3ConnectorOptions, 'loginType'>

export const googleV3 = (options: GoogleV3Options): Wallet => ({
  id: 'google-v3',
  logoDark: GoogleLogo,
  logoLight: GoogleLogo,
  monochromeLogoDark: getMonochromeGoogleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeGoogleLogo({ isDarkMode: false }),
  name: 'Google',
  type: 'social',
  createConnector: () => {
    const connector = sequenceV3Wallet({
      ...options,
      loginType: 'google'
    })
    return connector
  }
})

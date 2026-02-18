import type { Wallet } from '../../types.js'
import { sequenceV3Wallet, type BaseSequenceV3ConnectorOptions } from '../wagmiConnectors/sequenceV3Connector.js'

import { getAppleLogo, getMonochromeAppleLogo } from './AppleLogo.js'

export type AppleV3Options = Omit<BaseSequenceV3ConnectorOptions, 'loginType'>

export const appleV3 = (options: AppleV3Options): Wallet => ({
  id: 'apple-v3',
  logoDark: getAppleLogo({ isDarkMode: true }),
  logoLight: getAppleLogo({ isDarkMode: false }),
  monochromeLogoDark: getMonochromeAppleLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeAppleLogo({ isDarkMode: false }),
  name: 'Apple',
  type: 'social',
  createConnector: () => {
    const connector = sequenceV3Wallet({
      ...options,
      loginType: 'apple'
    })
    return connector
  }
})

import type { Wallet } from '../../types.js'
import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector.js'

import { getAppleLogo, getAppleMonochromeLogo } from './AppleLogo.js'

export type AppleWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const appleWaas = (options: AppleWaasOptions): Wallet => ({
  id: 'apple-waas',
  logoDark: getAppleLogo({ isDarkMode: true }),
  logoLight: getAppleLogo({ isDarkMode: false }),
  monochromeLogoDark: getAppleMonochromeLogo({ isDarkMode: true }),
  monochromeLogoLight: getAppleMonochromeLogo({ isDarkMode: false }),
  name: 'Apple',
  type: 'social',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'apple'
    })
    return connector
  }
})

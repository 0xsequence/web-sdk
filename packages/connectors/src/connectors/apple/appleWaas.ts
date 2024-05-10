import { Wallet } from '@0xsequence/kit'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

import { getAppleLogo, getAppleMonochromeLogo } from './AppleLogo'


export type AppleWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const appleWaas = (options: AppleWaasOptions): Wallet => ({
  id: 'apple-waas',
  logoDark: getAppleLogo({ isDarkMode: true }),
  logoLight: getAppleLogo({ isDarkMode: false }),
  monochromeLogoDark: getAppleMonochromeLogo({ isDarkMode: true }),
  monochromeLogoLight: getAppleMonochromeLogo({ isDarkMode: false }),
  name: 'Apple',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'apple'
    })
    return connector
  }
})

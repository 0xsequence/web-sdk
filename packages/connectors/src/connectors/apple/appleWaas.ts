import { CreateConnectorFn } from 'wagmi'

import { getAppleLogo, getAppleMonochromeLogo } from './AppleLogo'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

export type AppleWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const appleWaas = (options: AppleWaasOptions) => ({
  id: 'apple-waas',
  logoDark: getAppleLogo({ isDarkMode: true }),
  logoLight: getAppleLogo({ isDarkMode: false }),
  monochromeLogoDark: getAppleMonochromeLogo({ isDarkMode: true }),
  monochromeLogoLight: getAppleMonochromeLogo({ isDarkMode: false }),
  name: 'Apple',
  createConnector: (() => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'apple'
    })
    return connector
  }) as () => CreateConnectorFn
})

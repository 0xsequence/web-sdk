import { CreateConnectorFn } from 'wagmi'

import { getEmailLogo } from './EmailLogo'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

export type EmailWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const emailWaas = (options: EmailWaasOptions) => ({
  id: 'email-waas',
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  name: 'Email',
  createConnector: (() => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'email'
    })
    return connector
  }) as () => CreateConnectorFn
})

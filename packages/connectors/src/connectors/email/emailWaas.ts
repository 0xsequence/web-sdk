import { CreateConnectorFn } from 'wagmi'

import { getEmailLogo } from './EmailLogo'

import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

export type EmailWaasOptions = BaseSequenceWaasConnectorOptions

export const emailWaas = (options: EmailWaasOptions) => ({
  id: 'email-waas',
  isSequenceBased: true,
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  name: 'Email',
  createConnector: (() => {
    const connector = sequenceWaasWallet({
      ...options
    })
    return connector
  }) as () => CreateConnectorFn
})

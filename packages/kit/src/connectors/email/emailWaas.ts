import { Wallet } from '../../types'
import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

import { getEmailLogo } from './EmailLogo'

export type EmailWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const emailWaas = (options: EmailWaasOptions): Wallet => ({
  id: 'email-waas',
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  name: 'Email',
  type: 'social',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'email'
    })
    return connector
  }
})

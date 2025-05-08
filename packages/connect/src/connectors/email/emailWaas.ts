import type { Wallet } from '../../types.js'
import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector.js'

import { getEmailLogo } from './EmailLogo.js'

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

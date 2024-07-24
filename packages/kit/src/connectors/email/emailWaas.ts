import { Wallet } from '../../types'
import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

import { getEmailLogo } from './EmailLogo'

export type EmailWaasOptions = { emailAuthVersion?: 1 | 2 } & Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const emailWaas = ({ emailAuthVersion = 2, ...rest }: EmailWaasOptions): Wallet => ({
  id: 'email-waas',
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  name: 'Email',
  type: 'social',
  createConnector: () => {
    const options = { emailAuthVersion, ...rest }
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'email'
    })
    return connector
  }
})

import { Wallet } from '../../types'
import { sequenceWaasWallet, BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector'

import { getEmailLogo } from './EmailLogo'

export type EmailWaasOptions = { legacyEmailAuth?: boolean } & Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const emailWaas = ({ legacyEmailAuth = false, ...rest }: EmailWaasOptions): Wallet => ({
  id: 'email-waas',
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  name: 'Email',
  type: 'social',
  createConnector: () => {
    const options = { legacyEmailAuth, ...rest }
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'email'
    })
    return connector
  }
})

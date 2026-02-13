import type { Wallet } from '../../types.js'
import { sequenceV3Wallet, type BaseSequenceV3ConnectorOptions } from '../wagmiConnectors/sequenceV3Connector.js'

import { getEmailLogo } from './EmailLogo.js'

export type EmailV3Options = Omit<BaseSequenceV3ConnectorOptions, 'loginType'>

export const emailV3 = (options: EmailV3Options): Wallet => ({
  id: 'email-v3',
  logoDark: getEmailLogo({ isDarkMode: true }),
  logoLight: getEmailLogo({ isDarkMode: false }),
  name: 'Email',
  type: 'social',
  createConnector: () => {
    const connector = sequenceV3Wallet({
      ...options,
      loginType: 'email'
    })
    return connector
  }
})

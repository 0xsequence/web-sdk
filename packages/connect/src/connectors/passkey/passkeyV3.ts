import type { Wallet } from '../../types.js'
import { sequenceV3Wallet, type BaseSequenceV3ConnectorOptions } from '../wagmiConnectors/sequenceV3Connector.js'

import { getPasskeyLogo } from './PasskeyLogo.js'

export type PasskeyV3Options = Omit<BaseSequenceV3ConnectorOptions, 'loginType'>

export const passkeyV3 = (options: PasskeyV3Options): Wallet => ({
  id: 'passkey-v3',
  logoDark: getPasskeyLogo({ isDarkMode: true }),
  logoLight: getPasskeyLogo({ isDarkMode: false }),
  name: 'Passkey',
  type: 'social',
  createConnector: () => {
    const connector = sequenceV3Wallet({
      ...options,
      loginType: 'passkey'
    })
    return connector
  }
})

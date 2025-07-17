import type { Wallet } from '../../types.js'
import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/index.js'

import { getXLogo } from './XLogo.js'

export type XWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const XWaas = (options: XWaasOptions): Wallet => ({
  id: 'X-waas',
  logoDark: getXLogo({ isDarkMode: true }),
  logoLight: getXLogo({ isDarkMode: false }),
  name: 'X',
  type: 'social',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'X'
    })
    return connector
  }
})

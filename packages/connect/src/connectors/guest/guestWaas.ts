import type { Wallet } from '../../types.js'
import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector.js'

import { getGuestLogo } from './GuestLogo.js'

export type GuestWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const guestWaas = (options: GuestWaasOptions): Wallet => ({
  id: 'guest-waas',
  logoDark: getGuestLogo({ isDarkMode: true }),
  logoLight: getGuestLogo({ isDarkMode: false }),
  name: 'Guest',
  type: 'social',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'guest'
    })
    return connector
  }
})

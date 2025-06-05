import type { Wallet } from '../../types.js'
import { sequenceWaasWallet, type BaseSequenceWaasConnectorOptions } from '../wagmiConnectors/sequenceWaasConnector.js'

import { getMonochromeEpicLogo } from './EpicLogo.js'
import { EpicLogo } from './EpicLogo.js'

export type EpicWaasOptions = Omit<BaseSequenceWaasConnectorOptions, 'loginType'>

export const epicWaas = (options: EpicWaasOptions): Wallet => ({
  id: 'epic-waas',
  logoDark: EpicLogo,
  logoLight: EpicLogo,
  monochromeLogoDark: getMonochromeEpicLogo({ isDarkMode: true }),
  monochromeLogoLight: getMonochromeEpicLogo({ isDarkMode: false }),
  name: 'Epic',
  type: 'social',
  createConnector: () => {
    const connector = sequenceWaasWallet({
      ...options,
      loginType: 'epic'
    })
    return connector
  }
})

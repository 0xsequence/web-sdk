import type { Wallet, WalletProperties } from '../../types.js'
import { sequenceV3Wallet, type BaseSequenceV3ConnectorOptions } from '../wagmiConnectors/sequenceV3Connector.js'

export type EcosystemWalletDefinition = Pick<
  WalletProperties,
  'logoDark' | 'logoLight' | 'monochromeLogoDark' | 'monochromeLogoLight'
> & {
  id?: string
  name: string
  ctaText?: string
  loginType?: BaseSequenceV3ConnectorOptions['loginType']
}

export type EcosystemV3Options = Omit<BaseSequenceV3ConnectorOptions, 'loginType'> & EcosystemWalletDefinition

export const ecosystemV3 = (options: EcosystemV3Options): Wallet => {
  const { id, name, ctaText, logoDark, logoLight, monochromeLogoDark, monochromeLogoLight, loginType, ...connectorOptions } =
    options

  const walletId = id || createEcosystemWalletId(name)

  return {
    id: walletId,
    logoDark,
    logoLight,
    monochromeLogoDark,
    monochromeLogoLight,
    name,
    type: 'social',
    isSequenceBased: true,
    isEcosystemWallet: true,
    ctaText: ctaText || `Connect with ${name}`,
    createConnector: () => {
      const connector = sequenceV3Wallet({
        ...connectorOptions,
        loginType,
        loginStorageKey: walletId
      })
      return connector
    }
  }
}

const createEcosystemWalletId = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized ? `ecosystem-v3-${normalized}` : 'ecosystem-v3'
}

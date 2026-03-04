import type { FunctionComponent } from 'react'
import { createElement } from 'react'

import type { LogoProps, Wallet, WalletProperties } from '../../types.js'
import { sequenceV3Wallet, type BaseSequenceV3ConnectorOptions } from '../wagmiConnectors/sequenceV3Connector.js'

const DefaultLogo: FunctionComponent<LogoProps> = ({ className, style }) => {
  return createElement('div', {
    className,
    style: {
      width: '100%',
      height: '100%',
      backgroundColor: 'currentColor',
      borderRadius: '50%',
      ...style
    }
  })
}

export type EcosystemWalletDefinition = Partial<
  Pick<WalletProperties, 'logoDark' | 'logoLight' | 'monochromeLogoDark' | 'monochromeLogoLight'>
> & {
  id?: string
  name?: string
  ctaText?: string
  loginType?: BaseSequenceV3ConnectorOptions['loginType']
}

export type EcosystemV3Options = Omit<BaseSequenceV3ConnectorOptions, 'loginType'> & EcosystemWalletDefinition

export const ecosystemV3 = (options: EcosystemV3Options): Wallet => {
  const { id, name, ctaText, logoDark, logoLight, monochromeLogoDark, monochromeLogoLight, loginType, ...connectorOptions } =
    options

  const walletId = id || createEcosystemWalletId(name || '')
  const walletName = name || 'Wallet'

  return {
    id: walletId,
    logoDark: logoDark || DefaultLogo,
    logoLight: logoLight || DefaultLogo,
    monochromeLogoDark: monochromeLogoDark || logoDark || DefaultLogo,
    monochromeLogoLight: monochromeLogoLight || logoLight || DefaultLogo,
    name: walletName,
    type: 'social',
    isSequenceBased: true,
    isEcosystemWallet: true,
    ctaText: ctaText || `Connect with ${walletName}`,
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

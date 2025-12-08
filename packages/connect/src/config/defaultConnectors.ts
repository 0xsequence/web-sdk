import type { CreateConnectorFn } from 'wagmi'

import { XWaas } from '../connectors/X/XWaas.js'
import { appleWaas } from '../connectors/apple/appleWaas.js'
import { appleV3 } from '../connectors/apple/applev3.js'
import { coinbaseWallet } from '../connectors/coinbaseWallet/coinbaseWallet.js'
import { ecosystemV3, type EcosystemWalletDefinition } from '../connectors/ecosystem/ecosystemV3.js'
import { emailWaas } from '../connectors/email/emailWaas.js'
import { emailV3 } from '../connectors/email/emailv3.js'
import { epicWaas } from '../connectors/epic/epicWaas.js'
import { googleWaas } from '../connectors/google/googleWaas.js'
import { googleV3 } from '../connectors/google/googleV3.js'
import { guestWaas } from '../connectors/guest/guestWaas.js'
import { metaMask } from '../connectors/metaMask/metaMask.js'
import { passkeyV3 } from '../connectors/passkey/passkeyV3.js'
import { walletConnect } from '../connectors/walletConnect/walletConnect.js'
import type { Wallet, WalletType } from '../types.js'
import { getConnectWallets } from '../utils/getConnectWallets.js'
import type { ExplicitSessionParams } from '../utils/session/types.js'

export interface CommonConnectorOptions {
  appName: string
  projectAccessKey: string
  walletUrl?: string
  dappOrigin?: string
  defaultChainId?: number
}

export interface DefaultV3ConnectorOptions extends CommonConnectorOptions {
  email?: boolean
  google?: boolean
  apple?: boolean
  passkey?: boolean
  coinbase?: boolean
  metaMask?: boolean
  walletConnect?:
    | false
    | {
        projectId: string
      }
  ecosystemWallets?: EcosystemWalletDefinition[]
  additionalWallets?: Wallet[]
  /**
   * @deprecated, use connectors.walletConnect.projectId instead
   */
  walletConnectProjectId?: string
  explicitSessionParams?: ExplicitSessionParams
  includeFeeOptionPermissions?: boolean
  enableImplicitSession?: boolean
  nodesUrl?: string
  relayerUrl?: string
}

export interface DefaultWaasConnectorOptions extends CommonConnectorOptions {
  waasConfigKey: string
  enableConfirmationModal?: boolean

  guest?: boolean

  email?: boolean

  google?:
    | false
    | {
        clientId: string
      }
  apple?:
    | false
    | {
        clientId: string
        redirectURI: string
      }

  epic?:
    | false
    | {
        authUrl: string
      }

  X?:
    | false
    | {
        clientId: string
        redirectURI: string
      }
  coinbase?: boolean
  metaMask?: boolean
  walletConnect?:
    | false
    | {
        projectId: string
      }
  additionalWallets?: Wallet[]

  /**
   * @deprecated use connectors.walletConnect.projectId instead
   */
  walletConnectProjectId?: string

  /**
   * @deprecated, use connectors.google.clientId instead
   */
  googleClientId?: string

  /**
   * @deprecated, use connectors.apple.clientId instead
   */
  appleClientId?: string

  /**
   * @deprecated, use connectors.apple.redirectURI instead
   */
  appleRedirectURI?: string
}

export type DefaultConnectorOptions<T extends WalletType> = T extends 'waas'
  ? DefaultWaasConnectorOptions
  : DefaultV3ConnectorOptions

export const getDefaultConnectors = <T extends WalletType>(walletType: T, options: DefaultConnectorOptions<T>) => {
  if (walletType === 'waas') {
    return getDefaultWaasConnectors(options as DefaultWaasConnectorOptions)
  }

  return getDefaultV3Connectors(options as DefaultV3ConnectorOptions)
}

export const getDefaultWaasConnectors = (options: DefaultWaasConnectorOptions): CreateConnectorFn[] => {
  const { projectAccessKey, waasConfigKey, appName, enableConfirmationModal, defaultChainId } = options

  const wallets: Wallet[] = []

  if (options.guest) {
    wallets.push(
      guestWaas({
        projectAccessKey,
        waasConfigKey,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  if (options.email) {
    wallets.push(
      emailWaas({
        projectAccessKey,
        waasConfigKey,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  if (options.google || options.googleClientId) {
    const googleClientId = (options.google && options.google.clientId) || options.googleClientId!

    wallets.push(
      googleWaas({
        projectAccessKey,
        waasConfigKey,
        googleClientId,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  if (options.apple || (options.appleClientId && options.appleRedirectURI)) {
    const appleClientId = (options.apple && options.apple.clientId) || options.appleClientId!
    const appleRedirectURI = (options.apple && options.apple.redirectURI) || options.appleRedirectURI!

    wallets.push(
      appleWaas({
        projectAccessKey,
        waasConfigKey,
        appleClientId,
        appleRedirectURI,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  if (options.epic) {
    wallets.push(
      epicWaas({
        projectAccessKey,
        waasConfigKey,
        epicAuthUrl: options.epic.authUrl,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  if (options.X) {
    wallets.push(
      XWaas({
        projectAccessKey,
        waasConfigKey,
        XClientId: options.X.clientId,
        XRedirectURI: options.X.redirectURI,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  if (options.metaMask !== false) {
    if (typeof window !== 'undefined') {
      wallets.push(
        metaMask({
          dappMetadata: {
            name: appName,
            url: window.location.origin,
            iconUrl: `https://www.google.com/s2/favicons?domain_url=${window.location.origin}`
          }
        })
      )
    }
  }

  if (options.coinbase !== false) {
    wallets.push(
      coinbaseWallet({
        appName
      })
    )
  }

  if (options.walletConnect || options.walletConnectProjectId) {
    const projectId = (options.walletConnect && options.walletConnect?.projectId) || options.walletConnectProjectId!

    wallets.push(
      walletConnect({
        projectId,
        defaultNetwork: defaultChainId
      })
    )
  }

  if (options?.additionalWallets && options?.additionalWallets.length > 0) {
    wallets.push(...options.additionalWallets)
  }

  return getConnectWallets(projectAccessKey, wallets)
}

export const getDefaultV3Connectors = (options: DefaultV3ConnectorOptions): CreateConnectorFn[] => {
  const { projectAccessKey, appName, walletUrl, dappOrigin, defaultChainId = 1 } = options
  const hasEcosystemWallets = Array.isArray(options.ecosystemWallets) && options.ecosystemWallets.length > 0
  const shouldIncludeStandardSocialWallets = !hasEcosystemWallets

  const wallets: Wallet[] = []

  if (shouldIncludeStandardSocialWallets && options.email !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Email wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      emailV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (shouldIncludeStandardSocialWallets && options.google !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Google wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      googleV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (shouldIncludeStandardSocialWallets && options.apple !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Apple wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      appleV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (shouldIncludeStandardSocialWallets && options.passkey !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Passkey wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      passkeyV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (options.ecosystemWallets && options.ecosystemWallets.length > 0) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Ecosystem wallets require walletUrl and dappOrigin to be set')
    }
    options.ecosystemWallets.forEach(ecosystemWallet => {
      wallets.push(
        ecosystemV3({
          projectAccessKey: projectAccessKey,
          walletUrl: walletUrl,
          defaultNetwork: defaultChainId,
          dappOrigin: dappOrigin,
          explicitSessionParams: options.explicitSessionParams,
          enableImplicitSession: options.enableImplicitSession,
          includeFeeOptionPermissions: options.includeFeeOptionPermissions,
          nodesUrl: options.nodesUrl,
          relayerUrl: options.relayerUrl,
          id: ecosystemWallet.id,
          name: ecosystemWallet.name,
          logoDark: ecosystemWallet.logoDark,
          logoLight: ecosystemWallet.logoLight,
          monochromeLogoDark: ecosystemWallet.monochromeLogoDark,
          monochromeLogoLight: ecosystemWallet.monochromeLogoLight,
          ctaText: ecosystemWallet.ctaText,
          loginType: ecosystemWallet.loginType
        })
      )
    })
  }

  if (options.metaMask !== false) {
    if (typeof window !== 'undefined') {
      wallets.push(
        metaMask({
          dappMetadata: {
            name: appName,
            url: window.location.origin,
            iconUrl: `https://www.google.com/s2/favicons?domain_url=${window.location.origin}`
          }
        })
      )
    }
  }

  if (options.coinbase !== false) {
    wallets.push(
      coinbaseWallet({
        appName
      })
    )
  }

  if (options.walletConnect || options.walletConnectProjectId) {
    const projectId = (options.walletConnect && options.walletConnect?.projectId) || options.walletConnectProjectId!

    wallets.push(
      walletConnect({
        projectId,
        defaultNetwork: defaultChainId
      })
    )
  }

  if (options?.additionalWallets && options?.additionalWallets.length > 0) {
    wallets.push(...options.additionalWallets)
  }

  return getConnectWallets(projectAccessKey, wallets)
}

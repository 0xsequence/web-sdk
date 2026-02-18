import type { CreateConnectorFn } from 'wagmi'

import { appleV3 } from '../connectors/apple/applev3.js'
import { appleWaas } from '../connectors/apple/appleWaas.js'
import { coinbaseWallet } from '../connectors/coinbaseWallet/coinbaseWallet.js'
import { ecosystemV3 } from '../connectors/ecosystem/ecosystemV3.js'
import { emailV3 } from '../connectors/email/emailv3.js'
import { emailWaas } from '../connectors/email/emailWaas.js'
import { epicWaas } from '../connectors/epic/epicWaas.js'
import { googleV3 } from '../connectors/google/googleV3.js'
import { googleWaas } from '../connectors/google/googleWaas.js'
import { guestWaas } from '../connectors/guest/guestWaas.js'
import { metaMask } from '../connectors/metaMask/metaMask.js'
import { passkeyV3 } from '../connectors/passkey/passkeyV3.js'
import { walletConnect } from '../connectors/walletConnect/walletConnect.js'
import { XWaas } from '../connectors/X/XWaas.js'
import type { EthAuthSettings, Wallet, WalletType } from '../types.js'
import { getConnectWallets } from '../utils/getConnectWallets.js'
import type { ExplicitSessionParams } from '../utils/session/types.js'

export interface CommonConnectorOptions {
  appName?: string
  projectAccessKey: string
  walletUrl?: string
  dappOrigin?: string
  defaultChainId?: number
}

const resolveDappOrigin = (dappOrigin?: string) => {
  if (dappOrigin) {
    return dappOrigin
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return undefined
}

const resolveAppName = (options: CommonConnectorOptions & { signIn?: { projectName?: string } }) => {
  if (options.appName) {
    return options.appName
  }

  if (options.signIn?.projectName) {
    return options.signIn.projectName
  }

  return ''
}

export interface DefaultV3ConnectorOptions extends CommonConnectorOptions {
  signIn?: {
    projectName?: string
  }
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
  additionalWallets?: Wallet[]
  /**
   * @deprecated, use connectors.walletConnect.projectId instead
   */
  walletConnectProjectId?: string
  explicitSessionParams?: ExplicitSessionParams
  includeFeeOptionPermissions?: boolean
  enableImplicitSession?: boolean
  ethAuth?: EthAuthSettings | false
  nodesUrl?: string
  relayerUrl?: string
}

const resolveV3EthAuthSettings = (
  options: DefaultV3ConnectorOptions,
  defaultAppName: string,
  defaultOrigin?: string
): EthAuthSettings | false => {
  if (options.ethAuth === false) {
    return false
  }

  const ethAuth = options.ethAuth ?? {}

  return {
    app: ethAuth.app ?? (defaultAppName || 'app'),
    origin: ethAuth.origin ?? defaultOrigin,
    expiry: ethAuth.expiry,
    nonce: ethAuth.nonce
  }
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
  const { projectAccessKey, waasConfigKey, enableConfirmationModal, defaultChainId } = options
  const appName = resolveAppName(options)

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
  const { projectAccessKey, walletUrl, dappOrigin, defaultChainId = 1 } = options
  const resolvedDappOrigin = resolveDappOrigin(dappOrigin)
  const appName = resolveAppName(options)
  const defaultEthAuthAppName = options.signIn?.projectName || 'app'
  const ethAuth = resolveV3EthAuthSettings(options, defaultEthAuthAppName, resolvedDappOrigin)

  const wallets: Wallet[] = []

  if (options.email !== false) {
    if (!walletUrl || !resolvedDappOrigin) {
      throw new Error('Email wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      emailV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: resolvedDappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        ethAuth,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (options.google !== false) {
    if (!walletUrl || !resolvedDappOrigin) {
      throw new Error('Google wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      googleV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: resolvedDappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        ethAuth,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (options.apple !== false) {
    if (!walletUrl || !resolvedDappOrigin) {
      throw new Error('Apple wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      appleV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: resolvedDappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        ethAuth,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (options.passkey !== false) {
    if (!walletUrl || !resolvedDappOrigin) {
      throw new Error('Passkey wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      passkeyV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: resolvedDappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        ethAuth,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (walletUrl && resolvedDappOrigin) {
    wallets.push(
      ecosystemV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: resolvedDappOrigin,
        explicitSessionParams: options.explicitSessionParams,
        enableImplicitSession: options.enableImplicitSession,
        includeFeeOptionPermissions: options.includeFeeOptionPermissions,
        ethAuth,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
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

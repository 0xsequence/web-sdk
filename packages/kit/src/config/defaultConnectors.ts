import { CreateConnectorFn } from 'wagmi'

import { apple } from '../connectors/apple'
import { appleWaas } from '../connectors/apple/appleWaas'
import { coinbaseWallet } from '../connectors/coinbaseWallet'
import { email } from '../connectors/email'
import { emailWaas } from '../connectors/email/emailWaas'
import { facebook } from '../connectors/facebook'
import { google } from '../connectors/google'
import { googleWaas } from '../connectors/google/googleWaas'
import { sequence } from '../connectors/sequence'
import { twitch } from '../connectors/twitch'
import { walletConnect } from '../connectors/walletConnect'
import { Wallet, WalletType } from '../types'
import { getKitConnectWallets } from '../utils/getKitConnectWallets'

export interface CommonConnectorOptions {
  appName: string
  projectAccessKey: string
  defaultChainId?: number
}

export interface DefaultWaasConnectorOptions extends CommonConnectorOptions {
  waasConfigKey: string
  enableConfirmationModal?: boolean
  isDev?: boolean

  email?:
    | boolean
    | {
        legacyEmailAuth: boolean
      }
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
  coinbase?: boolean
  walletConnect?:
    | false
    | {
        projectId: string
      }

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

  /**
   * @deprecated, use connectors.email.legacyAuth instead
   */
  legacyEmailAuth?: boolean
}

export interface DefaultUniversalConnectorOptions extends CommonConnectorOptions {
  sequence?: boolean
  email?: boolean
  google?: boolean
  facebook?: boolean
  twitch?: boolean
  apple?: boolean
  walletConnect?:
    | false
    | {
        projectId: string
      }

  /**
   * @deprecated, use connectors.walletConnect.projectId instead
   */
  walletConnectProjectId?: string
}

export type DefaultConnectorOptions<T extends WalletType> = T extends 'waas'
  ? DefaultWaasConnectorOptions
  : DefaultUniversalConnectorOptions

export const getDefaultConnectors = <T extends WalletType>(walletType: T, options: DefaultConnectorOptions<T>) => {
  if (walletType === 'waas') {
    return getDefaultWaasConnectors(options as DefaultWaasConnectorOptions)
  } else if (walletType === 'universal') {
    return getDefaultUniversalConnectors(options as DefaultUniversalConnectorOptions)
  }
}

export const getDefaultWaasConnectors = (options: DefaultWaasConnectorOptions): CreateConnectorFn[] => {
  const { projectAccessKey, waasConfigKey, appName, enableConfirmationModal, defaultChainId, isDev } = options

  const wallets: Wallet[] = []

  if (options.email !== false) {
    wallets.push(
      emailWaas({
        projectAccessKey,
        waasConfigKey,
        enableConfirmationModal,
        network: defaultChainId,
        legacyEmailAuth: (typeof options.email === 'object' && options.email.legacyEmailAuth) || options.legacyEmailAuth,
        isDev
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
        network: defaultChainId,
        isDev
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
        network: defaultChainId,
        isDev
      })
    )
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
        projectId
      })
    )
  }

  return getKitConnectWallets(projectAccessKey, wallets)
}

export const getDefaultUniversalConnectors = (options: DefaultUniversalConnectorOptions): CreateConnectorFn[] => {
  const { projectAccessKey, appName, defaultChainId } = options

  const wallets: Wallet[] = []

  if (options.email !== false) {
    wallets.push(
      email({
        defaultNetwork: defaultChainId,
        connect: {
          app: appName
        }
      })
    )
  }

  if (options.google !== false) {
    wallets.push(
      google({
        defaultNetwork: defaultChainId,
        connect: {
          app: appName
        }
      })
    )
  }

  if (options.facebook !== false) {
    wallets.push(
      facebook({
        defaultNetwork: defaultChainId,
        connect: {
          app: appName
        }
      })
    )
  }

  if (options.twitch !== false) {
    wallets.push(
      twitch({
        defaultNetwork: defaultChainId,
        connect: {
          app: appName
        }
      })
    )
  }

  if (options.apple !== false) {
    wallets.push(
      apple({
        defaultNetwork: defaultChainId,
        connect: {
          app: appName
        }
      })
    )
  }

  if (options.sequence !== false) {
    wallets.push(
      sequence({
        defaultNetwork: defaultChainId,
        connect: {
          app: appName
        }
      })
    )
  }

  if (options.walletConnect || options.walletConnectProjectId) {
    const projectId = (options.walletConnect && options.walletConnect?.projectId) || options.walletConnectProjectId!

    wallets.push(
      walletConnect({
        projectId
      })
    )
  }

  return getKitConnectWallets(projectAccessKey, wallets)
}

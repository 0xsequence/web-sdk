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
import { WalletType } from '../types'
import { getKitConnectWallets } from '../utils/getKitConnectWallets'

export interface CommonConnectorOptions {
  appName: string
  projectAccessKey: string
  walletConnectProjectId: string
  defaultChainId?: number
}

export interface DefaultWaasConnectorOptions extends CommonConnectorOptions {
  waasConfigKey: string
  googleClientId?: string
  appleClientId?: string
  appleRedirectURI?: string
  enableConfirmationModal?: boolean
  legacyEmailAuth?: boolean
  isDev?: boolean
}

export interface DefaultUniversalConnectorOptions extends CommonConnectorOptions {}

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

export const getDefaultWaasConnectors = ({
  appName,
  projectAccessKey,
  walletConnectProjectId,
  defaultChainId,

  waasConfigKey,
  googleClientId,
  appleClientId,
  appleRedirectURI,
  enableConfirmationModal,
  legacyEmailAuth = false,
  isDev = false
}: DefaultWaasConnectorOptions): CreateConnectorFn[] => {
  const wallets: any[] = [
    emailWaas({
      projectAccessKey,
      waasConfigKey,
      enableConfirmationModal,
      network: defaultChainId,
      legacyEmailAuth,
      isDev
    }),
    coinbaseWallet({
      appName
    }),
    walletConnect({
      projectId: walletConnectProjectId
    })
  ]
  if (googleClientId) {
    wallets.push(
      googleWaas({
        projectAccessKey,
        googleClientId,
        waasConfigKey,
        enableConfirmationModal,
        network: defaultChainId,
        isDev
      })
    )
  }
  if (appleClientId && appleRedirectURI) {
    wallets.push(
      appleWaas({
        projectAccessKey,
        appleClientId,
        appleRedirectURI,
        waasConfigKey,
        enableConfirmationModal,
        network: defaultChainId,
        isDev
      })
    )
  }

  const connectors = getKitConnectWallets(projectAccessKey, wallets)

  return connectors
}

export const getDefaultUniversalConnectors = ({
  appName,
  projectAccessKey,
  walletConnectProjectId,
  defaultChainId
}: DefaultUniversalConnectorOptions): CreateConnectorFn[] => {
  const connectors = getKitConnectWallets(projectAccessKey, [
    email({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    google({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    facebook({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    twitch({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    apple({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    sequence({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    walletConnect({
      projectId: walletConnectProjectId
    })
  ])

  return connectors
}

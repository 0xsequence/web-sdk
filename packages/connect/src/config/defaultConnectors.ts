import type { CreateConnectorFn } from 'wagmi'

import { appleV3 } from '../connectors/apple/applev3.js'
import { coinbaseWallet } from '../connectors/coinbaseWallet/coinbaseWallet.js'
import { ecosystemV3, type EcosystemWalletDefinition } from '../connectors/ecosystem/ecosystemV3.js'
import { emailV3 } from '../connectors/email/emailv3.js'
import { googleV3 } from '../connectors/google/googleV3.js'
import { metaMask } from '../connectors/metaMask/metaMask.js'
import { passkeyV3 } from '../connectors/passkey/passkeyV3.js'
import { walletConnect } from '../connectors/walletConnect/walletConnect.js'
import type { Wallet } from '../types.js'
import { getConnectWallets } from '../utils/getConnectWallets.js'
import type { ExplicitSessionParams } from '../utils/session/types.js'

export interface CommonConnectorOptions {
  appName: string
  projectAccessKey: string
  walletUrl?: string
  dappOrigin?: string
  defaultChainId?: number
}

export interface DefaultConnectorOptions extends CommonConnectorOptions {
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

export const getDefaultConnectors = (options: DefaultConnectorOptions): CreateConnectorFn[] => {
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

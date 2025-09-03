import type { Signers } from '@0xsequence/dapp-client'
import type { CreateConnectorFn } from 'wagmi'

import { appleV3 } from '../connectors/apple/applev3.js'
import { coinbaseWallet } from '../connectors/coinbaseWallet/coinbaseWallet.js'
import { emailV3 } from '../connectors/email/emailv3.js'
import { googleV3 } from '../connectors/google/googleV3.js'
import { metaMask } from '../connectors/metaMask/metaMask.js'
import { walletConnect } from '../connectors/walletConnect/walletConnect.js'
import type { Wallet } from '../types.js'
import { getConnectWallets } from '../utils/getConnectWallets.js'

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
  explicitSession?: Signers.Session.ExplicitParams
  enableImplicitSession?: boolean
  nodesUrl?: string
  relayerUrl?: string
}

export const getDefaultConnectors = (options: DefaultConnectorOptions): CreateConnectorFn[] => {
  const { projectAccessKey, appName, walletUrl, dappOrigin, defaultChainId = 1 } = options

  const wallets: Wallet[] = []

  if (options.email !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Email wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      emailV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSession: options.explicitSession,
        enableImplicitSession: options.enableImplicitSession,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (options.google !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Google wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      googleV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSession: options.explicitSession,
        enableImplicitSession: options.enableImplicitSession,
        nodesUrl: options.nodesUrl,
        relayerUrl: options.relayerUrl
      })
    )
  }

  if (options.apple !== false) {
    if (!walletUrl || !dappOrigin) {
      throw new Error('Apple wallet requires walletUrl and dappOrigin to be set')
    }
    wallets.push(
      appleV3({
        projectAccessKey: projectAccessKey,
        walletUrl: walletUrl,
        defaultNetwork: defaultChainId,
        dappOrigin: dappOrigin,
        explicitSession: options.explicitSession,
        enableImplicitSession: options.enableImplicitSession,
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

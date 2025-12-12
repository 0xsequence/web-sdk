import { ConnectConfig, createConfig, createContractPermission } from '@0xsequence/connect'
import { ChainId } from '@0xsequence/network'
import { Environment } from '@imtbl/config'
import { passport } from '@imtbl/sdk'
import { parseEther } from 'viem'

import { getEmitterContractAddress } from './constants/permissions'

// const searchParams = new URLSearchParams(location.search)

// append ?debug to url to enable debug mode
// const isDebugMode = searchParams.has('debug')
// @ts-ignore
const isDev = false
const projectAccessKey = isDev ? 'AQAAAAAAAAVBcvNU0sTXiBQmgnL-uVm929Y' : 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'
const walletConnectProjectId = 'c65a6cb1aa83c4e24500130f23a437d8'
export const WALLET_URL_STORAGE_KEY = 'sequence-react-example.walletUrl'
export const DEFAULT_WALLET_URL = 'https://immutable.ecosystem-demo.xyz'

export const sanitizeWalletUrl = (walletUrl: string): string => {
  const trimmed = walletUrl.trim()

  if (!trimmed || trimmed.endsWith('://')) {
    return DEFAULT_WALLET_URL
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '')
  return withoutTrailingSlash || DEFAULT_WALLET_URL
}

export const sponsoredContractAddresses: Record<number, `0x${string}`> = {
  [ChainId.ARBITRUM_NOVA]: '0x37470dac8a0255141745906c972e414b1409b470'
}

export const connectConfig: ConnectConfig = {
  projectAccessKey,
  walletUrl: DEFAULT_WALLET_URL,
  signIn: {
    descriptiveSocials: true,
    disableTooltipForDescriptiveSocials: true
  },
  // Custom css injected into shadow dom
  // customCSS: `
  //   span {
  //     color: red !important;
  //   }
  // `,
  displayedAssets: [],
  env: isDev
    ? {
        indexerGatewayUrl: 'https://dev-indexer.sequence.app',
        metadataUrl: 'https://dev-metadata.sequence.app',
        apiUrl: 'https://dev-api.sequence.app',
        indexerUrl: 'https://dev-indexer.sequence.app',
        builderUrl: 'https://dev-api.sequence.build'
      }
    : undefined
}

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: Environment.SANDBOX,
    publishableKey: 'pk_imapik-test-VEMeW7wUX7hE7LHg3FxY'
  },
  forceScwDeployBeforeMessageSignature: true,
  clientId: 'ap8Gv3188GLFROiBFBNFz77DojRpqxnS',
  redirectUri: `${window.location.origin}/auth-callback`,
  logoutRedirectUri: `${window.location.origin}`,
  audience: 'platform_api',
  scope: 'openid offline_access email transact'
})

export const loadWalletUrl = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_WALLET_URL
  }

  const stored = window.localStorage.getItem(WALLET_URL_STORAGE_KEY)
  return sanitizeWalletUrl(stored ?? DEFAULT_WALLET_URL)
}

export const persistWalletUrl = (walletUrl: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const sanitized = sanitizeWalletUrl(walletUrl)

  window.localStorage.setItem(WALLET_URL_STORAGE_KEY, sanitized)
}

export const createExampleConfig = (walletUrl: string) =>
  createConfig({
    ...connectConfig,
    walletUrl: sanitizeWalletUrl(walletUrl),
    dappOrigin: window.location.origin,
    appName: 'Sequence Web SDK Demo',
    defaultChainId: ChainId.OPTIMISM,
    walletConnect: {
      projectId: walletConnectProjectId
    },
    nodesUrl: isDev ? 'https://dev-nodes.sequence.app/{network}' : 'https://nodes.sequence.app/{network}',
    relayerUrl: isDev ? 'https://dev-{network}-relayer.sequence.app' : 'https://{network}-relayer.sequence.app',
    enableImplicitSession: true,
    includeFeeOptionPermissions: true,
    explicitSessionParams: {
      chainId: ChainId.OPTIMISM,
      nativeTokenSpending: {
        valueLimit: parseEther('0.1')
      },
      expiresIn: {
        days: 1
      },
      permissions: [
        createContractPermission({
          address: getEmitterContractAddress(window.location.origin),
          functionSignature: 'function explicitEmit()'
        })
      ]
    }
  })

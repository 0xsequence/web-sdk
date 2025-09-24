import { SequenceCheckoutConfig } from '@0xsequence/checkout'
import { ConnectConfig, createConfig, createContractPermission } from '@0xsequence/connect'
import { ChainId } from '@0xsequence/network'
import { Environment } from '@imtbl/config'
import { passport } from '@imtbl/sdk'
import { zeroAddress } from 'viem'

import { getEmitterContractAddress } from './constants/permissions'

const searchParams = new URLSearchParams(location.search)

// append ?type=waas|universal to url to switch between wallet types

// append ?debug to url to enable debug mode
const isDebugMode = searchParams.has('debug')
// @ts-ignore
const isDev = __SEQUENCE_WEB_SDK_IS_DEV__
const projectAccessKey = isDev ? 'AQAAAAAAAAK2JvvZhWqZ51riasWBftkrVXE' : 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'
const walletConnectProjectId = 'c65a6cb1aa83c4e24500130f23a437d8'

export const sponsoredContractAddresses: Record<number, `0x${string}`> = {
  [ChainId.ARBITRUM_NOVA]: '0x37470dac8a0255141745906c972e414b1409b470'
}

export const connectConfig: ConnectConfig = {
  projectAccessKey,
  defaultTheme: 'dark',
  signIn: {
    projectName: 'Sequence Web SDK Demo',
    useMock: isDebugMode
  },
  // Custom css injected into shadow dom
  // customCSS: `
  //   span {
  //     color: red !important;
  //   }
  // `,
  displayedAssets: [
    // Native token
    {
      contractAddress: zeroAddress,
      chainId: ChainId.ARBITRUM_NOVA
    },
    // Native token
    {
      contractAddress: zeroAddress,
      chainId: ChainId.ARBITRUM_SEPOLIA
    },
    // Waas demo NFT
    {
      contractAddress: '0x0d402c63cae0200f0723b3e6fa0914627a48462e',
      chainId: ChainId.ARBITRUM_NOVA
    },
    // Waas demo NFT
    {
      contractAddress: '0x0d402c63cae0200f0723b3e6fa0914627a48462e',
      chainId: ChainId.ARBITRUM_SEPOLIA
    },
    // Skyweaver assets
    {
      contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
      chainId: ChainId.POLYGON
    }
  ],
  readOnlyNetworks: [ChainId.OPTIMISM],
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

export const config = createConfig({
  ...connectConfig,
  walletUrl: 'http://localhost:5173',
  dappOrigin: window.location.origin,
  appName: 'Sequence Web SDK Demo',
  chainIds: [ChainId.ARBITRUM_SEPOLIA, ChainId.OPTIMISM],
  defaultChainId: ChainId.ARBITRUM_SEPOLIA,
  google: true,
  apple: true,
  email: true,
  passkey: true,
  walletConnect: {
    projectId: walletConnectProjectId
  },
  explicitSessionParams: {
    chainId: ChainId.ARBITRUM_SEPOLIA,
    nativeTokenSpending: {
      valueLimit: 0n
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

export const getErc1155SaleContractConfig = (walletAddress: string) => ({
  chain: 137,
  // ERC20 token sale
  contractAddress: '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b',
  collectionAddress: '0xdeb398f41ccd290ee5114df7e498cf04fac916cb',
  // Native token sale
  // contractAddress: '0xf0056139095224f4eec53c578ab4de1e227b9597',
  // collectionAddress: '0x92473261f2c26f2264429c451f70b0192f858795',
  wallet: walletAddress,
  items: [
    {
      tokenId: '1',
      quantity: '1'
    }
  ],
  onSuccess: () => {
    console.log('success')
  }
})

export const checkoutConfig: SequenceCheckoutConfig = {
  env: isDev
    ? {
        sardineCheckoutUrl: 'https://sardine-checkout-sandbox.sequence.info',
        sardineOnRampUrl: 'https://crypto.sandbox.sardine.ai/',
        transakApiUrl: 'https://global-stg.transak.com',
        transakApiKey: 'c20f2a0e-fe6a-4133-8fa7-77e9f84edf98'
      }
    : undefined
}

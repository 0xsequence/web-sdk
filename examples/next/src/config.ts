import { SequenceCheckoutConfig } from '@0xsequence/checkout'
import { ConnectConfig, createConfig, createContractPermission } from '@0xsequence/connect'
import { ChainId } from '@0xsequence/network'
import { Environment } from '@imtbl/config'
import { passport } from '@imtbl/sdk'
import { parseEther, zeroAddress } from 'viem'
import { cookieStorage, createStorage } from 'wagmi'

import { getEmitterContractAddress } from './constants/permissions'

const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

// append ?debug to url to enable debug mode
const isDebugMode = searchParams.has('debug')
const isDev = false
const projectAccessKey = isDev ? 'AQAAAAAAAAVBcvNU0sTXiBQmgnL-uVm929Y' : 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'
const walletConnectProjectId = 'c65a6cb1aa83c4e24500130f23a437d8'
const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

export const sponsoredContractAddresses: Record<number, `0x${string}`> = {
  [ChainId.ARBITRUM_NOVA]: '0x37470dac8a0255141745906c972e414b1409b470'
}

export const connectConfig: ConnectConfig = {
  projectAccessKey,
  walletUrl: 'https://v3.sequence-dev.app',
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

let passportInstance: passport.Passport | undefined

export const getPassportInstance = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  if (!passportInstance) {
    passportInstance = new passport.Passport({
      baseConfig: {
        environment: Environment.SANDBOX,
        publishableKey: 'pk_imapik-test-VEMeW7wUX7hE7LHg3FxY'
      },
      forceScwDeployBeforeMessageSignature: true,
      clientId: 'ap8Gv3188GLFROiBFBNFz77DojRpqxnS',
      redirectUri: `${defaultOrigin}/auth-callback`,
      logoutRedirectUri: `${defaultOrigin}`,
      audience: 'platform_api',
      scope: 'openid offline_access email transact'
    })
  }

  return passportInstance
}

export const config = createConfig({
  ...connectConfig,
  walletUrl: 'https://v3.sequence-dev.app',
  dappOrigin: defaultOrigin,
  appName: 'Sequence Web SDK Demo',
  chainIds: [ChainId.ARBITRUM_SEPOLIA, ChainId.OPTIMISM],
  defaultChainId: ChainId.OPTIMISM,
  google: true,
  apple: true,
  email: true,
  passkey: true,
  // ecosystemWallets: [
  //   {
  //     id: 'sequence-ecosystem',
  //     name: 'Sequence',
  //     ctaText: 'Continue with Sequence',
  //     logoDark: SequenceEcosystemLogo,
  //     logoLight: SequenceEcosystemLogo,
  //     monochromeLogoDark: SequenceEcosystemLogo,
  //     monochromeLogoLight: SequenceEcosystemLogo
  //   }
  // ],
  walletConnect: {
    projectId: walletConnectProjectId
  },
  nodesUrl: 'https://dev-nodes.sequence.app/{network}',
  relayerUrl: 'https://dev-{network}-relayer.sequence.app',
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
        address: getEmitterContractAddress(defaultOrigin),
        functionSignature: 'function explicitEmit()'
      })
    ]
  },
  wagmiConfig: {
    storage: createStorage({ storage: cookieStorage }),
    ssr: true
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

export const checkoutConfig: SequenceCheckoutConfig = {}

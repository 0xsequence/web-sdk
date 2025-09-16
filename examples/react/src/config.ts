import { SequenceCheckoutConfig } from '@0xsequence/checkout'
import { ConnectConfig, createConfig, WalletType } from '@0xsequence/connect'
import { immutable } from '@0xsequence/immutable-connector'
import { ChainId } from '@0xsequence/network'
import { Environment } from '@imtbl/config'
import { passport } from '@imtbl/sdk'
import { zeroAddress } from 'viem'

const searchParams = new URLSearchParams(location.search)

// append ?type=waas|universal to url to switch between wallet types
const walletType: WalletType = searchParams.get('type') === 'universal' ? 'universal' : 'waas'

// append ?debug to url to enable debug mode
const isDebugMode = searchParams.has('debug')
// @ts-ignore
const isDev = __SEQUENCE_WEB_SDK_IS_DEV__
const projectAccessKey = isDev ? 'AQAAAAAAAAbRfXdDS5e-ZD2pNeMcCtNnij4' : 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'
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

export const config =
  walletType === 'waas'
    ? createConfig('waas', {
        ...connectConfig,
        appName: 'Sequence Web SDK Demo',
        chainIds: [
          ChainId.ARBITRUM_NOVA,
          ChainId.ARBITRUM_SEPOLIA,
          ChainId.POLYGON,
          ChainId.IMMUTABLE_ZKEVM,
          ChainId.IMMUTABLE_ZKEVM_TESTNET,
          ChainId.BASE_SEPOLIA,
          ChainId.BASE
        ],
        defaultChainId: ChainId.ARBITRUM_NOVA,
        waasConfigKey: isDebugMode
          ? 'eyJwcm9qZWN0SWQiOjY5NCwicnBjU2VydmVyIjoiaHR0cHM6Ly9kZXYtd2Fhcy5zZXF1ZW5jZS5hcHAiLCJlbWFpbFJlZ2lvbiI6ImNhLWNlbnRyYWwtMSIsImVtYWlsQ2xpZW50SWQiOiI1NGF0bjV1cGk2M3FjNTlhMWVtM3ZiaHJzbiJ9'
          : 'eyJwcm9qZWN0SWQiOjE2ODE1LCJlbWFpbFJlZ2lvbiI6ImNhLWNlbnRyYWwtMSIsImVtYWlsQ2xpZW50SWQiOiI2N2V2NXVvc3ZxMzVmcGI2OXI3NnJoYnVoIiwicnBjU2VydmVyIjoiaHR0cHM6Ly93YWFzLnNlcXVlbmNlLmFwcCJ9',
        enableConfirmationModal: localStorage.getItem('confirmationEnabled') === 'true',

        guest: true,
        email: true,
        google: {
          clientId: isDebugMode
            ? '603294233249-6h5saeg2uiu8akpcbar3r2aqjp6j7oem.apps.googleusercontent.com'
            : '970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com'
        },
        apple: {
          clientId: 'com.horizon.sequence.waas',
          redirectURI: window.location.origin + window.location.pathname
        },
        X: {
          clientId: 'MVZ6aHMyNmMtSF9mNHVldFR6TV86MTpjaQ',
          redirectURI: window.location.origin + '/auth-callback-X'
        },
        walletConnect: {
          projectId: walletConnectProjectId
        },
        additionalWallets: [
          immutable({
            passportInstance,
            environment: Environment.SANDBOX
          })
        ]
      })
    : createConfig('universal', {
        ...connectConfig,
        appName: 'Sequence Web SDK Demo',
        chainIds: [
          ChainId.ARBITRUM_NOVA,
          ChainId.ARBITRUM,
          ChainId.ARBITRUM_SEPOLIA,
          ChainId.POLYGON,
          ChainId.IMMUTABLE_ZKEVM,
          ChainId.IMMUTABLE_ZKEVM_TESTNET,
          ChainId.BASE_SEPOLIA,
          ChainId.BASE,
          ChainId.SEPOLIA
        ],
        defaultChainId: ChainId.ARBITRUM_NOVA,

        walletConnect: {
          projectId: walletConnectProjectId
        },
        additionalWallets: [
          immutable({
            passportInstance,
            environment: Environment.SANDBOX
          })
        ]
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
        transakApiKey: 'c20f2a0e-fe6a-4133-8fa7-77e9f84edf98',
        forteWidgetUrl: 'https://payments.sandbox.lemmax.com/forte-payments-widget.js'
      }
    : undefined
}

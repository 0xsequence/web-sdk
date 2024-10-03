import { KitConfig, createConfig, WalletType } from '@0xsequence/kit'
import { ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'

const searchParams = new URLSearchParams(location.search)

// append ?type=waas|universal to url to switch between wallet types
const walletType: WalletType = searchParams.get('type') === 'universal' ? 'universal' : 'waas'

// append ?debug to url to enable debug mode
const isDebugMode = searchParams.has('debug')
const projectAccessKey = isDebugMode ? 'AQAAAAAAAAK2JvvZhWqZ51riasWBftkrVXE' : 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'
const walletConnectProjectId = 'c65a6cb1aa83c4e24500130f23a437d8'

export const kitConfig: KitConfig = {
  projectAccessKey,
  defaultTheme: 'dark',
  signIn: {
    projectName: 'Kit Demo',
    useMock: isDebugMode
  },
  isDev: isDebugMode,
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
  ]
}

export const config =
  walletType === 'waas'
    ? createConfig('waas', {
        ...kitConfig,
        appName: 'Kit Demo',
        chainIds: [ChainId.ARBITRUM_NOVA, ChainId.ARBITRUM_SEPOLIA, ChainId.POLYGON],
        defaultChainId: ChainId.ARBITRUM_NOVA,
        waasConfigKey: isDebugMode
          ? 'eyJwcm9qZWN0SWQiOjY5NCwicnBjU2VydmVyIjoiaHR0cHM6Ly9kZXYtd2Fhcy5zZXF1ZW5jZS5hcHAiLCJlbWFpbFJlZ2lvbiI6ImNhLWNlbnRyYWwtMSIsImVtYWlsQ2xpZW50SWQiOiI1NGF0bjV1cGk2M3FjNTlhMWVtM3ZiaHJzbiJ9'
          : 'eyJwcm9qZWN0SWQiOjE2ODE1LCJlbWFpbFJlZ2lvbiI6ImNhLWNlbnRyYWwtMSIsImVtYWlsQ2xpZW50SWQiOiI2N2V2NXVvc3ZxMzVmcGI2OXI3NnJoYnVoIiwicnBjU2VydmVyIjoiaHR0cHM6Ly93YWFzLnNlcXVlbmNlLmFwcCJ9',
        enableConfirmationModal: localStorage.getItem('confirmationEnabled') === 'true',

        google: {
          clientId: isDebugMode
            ? '603294233249-6h5saeg2uiu8akpcbar3r2aqjp6j7oem.apps.googleusercontent.com'
            : '970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com'
        },
        apple: {
          clientId: 'com.horizon.sequence.waas',
          redirectURI: window.location.origin + window.location.pathname
        },
        walletConnect: {
          projectId: walletConnectProjectId
        }
      })
    : createConfig('universal', {
        ...kitConfig,
        appName: 'Kit Demo',
        chainIds: [ChainId.ARBITRUM_NOVA, ChainId.ARBITRUM_SEPOLIA, ChainId.POLYGON],
        defaultChainId: ChainId.ARBITRUM_NOVA,

        walletConnect: {
          projectId: walletConnectProjectId
        }
      })

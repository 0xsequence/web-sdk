import { KitConfig, getDefaultChains, getDefaultConfig } from '@0xsequence/kit'
import { ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'
import { cookieStorage, createConfig, createStorage } from 'wagmi'

export type ConnectionMode = 'waas' | 'universal'

export const connectionMode = 'waas' as ConnectionMode
export const isDebugMode = false
const enableConfirmationModal = false

const projectAccessKey = 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'

const waasConfigKey = 'eyJwcm9qZWN0SWQiOjE2ODE1LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0='
const googleClientId = '970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com'
const appleClientId = 'com.horizon.sequence.waas'
const appleRedirectURI = 'http://localhost:3000'

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: 'Kit Demo',
    projectAccessKey,
    walletConnectProjectId: 'c65a6cb1aa83c4e24500130f23a437d8',
    chains: getDefaultChains([ChainId.ARBITRUM_NOVA, ChainId.ARBITRUM_SEPOLIA, ChainId.POLYGON]),
    defaultChainId: ChainId.ARBITRUM_NOVA,

    // Next.js doesn't support localStorage in SSR
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,

    // Waas specific config options
    ...(connectionMode === 'waas'
      ? {
          waasConfigKey,
          googleClientId,
          appleClientId,
          appleRedirectURI,
          enableConfirmationModal
        }
      : undefined)
  })
)

export const kitConfig: KitConfig = {
  projectAccessKey,
  defaultTheme: 'dark',
  signIn: {
    projectName: 'Kit Demo',
    useMock: isDebugMode
  },
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

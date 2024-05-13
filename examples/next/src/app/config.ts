import { KitConfig, getKitConnectWallets } from '@0xsequence/kit'
import { getDefaultConnectors, getDefaultWaasConnectors, mock } from '@0xsequence/kit-connectors'
import { findNetworkConfig, allNetworks } from '@0xsequence/network'
import { Transport, zeroAddress } from 'viem'
import { createConfig, createStorage, http, noopStorage } from 'wagmi'
import { Chain, arbitrumNova, arbitrumSepolia, mainnet, polygon } from 'wagmi/chains'

export type ConnectionMode = 'waas' | 'universal'

export const connectionMode = 'waas' as ConnectionMode
export const isDebugMode = false
const enableConfirmationModal = false

const projectAccessKey = 'AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI'

const chains = [arbitrumNova, arbitrumSepolia, mainnet, polygon] as const satisfies Chain[]
const transports = chains.reduce<Record<number, Transport>>((acc, chain) => {
  const network = findNetworkConfig(allNetworks, chain.id)

  if (network) {
    acc[chain.id] = http(network.rpcUrl)
  }

  return acc
}, {})

chains.forEach(chain => {
  const network = findNetworkConfig(allNetworks, chain.id)
  if (!network) return
  transports[chain.id] = http(network.rpcUrl)
})

const waasConfigKey = 'eyJwcm9qZWN0SWQiOjE2ODE1LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0='
const googleClientId = '970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com'
const appleClientId = 'com.horizon.sequence.waas'
const appleRedirectURI = 'http://localhost:3000'

const getWaasConnectors = () => {
  const connectors = [
    ...getDefaultWaasConnectors({
      walletConnectProjectId: 'c65a6cb1aa83c4e24500130f23a437d8',
      defaultChainId: arbitrumSepolia.id,
      waasConfigKey,
      googleClientId,
      appleClientId,
      appleRedirectURI,
      appName: 'Kit Demo',
      projectAccessKey,
      enableConfirmationModal
    }),
    ...(isDebugMode
      ? getKitConnectWallets(projectAccessKey, [
          mock({
            accounts: ['0xCb88b6315507e9d8c35D81AFB7F190aB6c3227C9']
          })
        ])
      : [])
  ]

  return connectors
}

const getUniversalConnectors = () => {
  const connectors = [
    ...getDefaultConnectors({
      walletConnectProjectId: 'c65a6cb1aa83c4e24500130f23a437d8',
      defaultChainId: arbitrumNova.id,
      appName: 'demo app',
      projectAccessKey
    }),
    ...(isDebugMode
      ? getKitConnectWallets(projectAccessKey, [
          mock({
            accounts: ['0xCb88b6315507e9d8c35D81AFB7F190aB6c3227C9']
          })
        ])
      : [])
  ]
  return connectors
}

export const wagmiConfig = createConfig({
  transports,
  chains,
  connectors: connectionMode === 'waas' ? getWaasConnectors() : getUniversalConnectors(),
  storage: createStorage({
    storage: typeof window !== 'undefined' && window.localStorage ? window.localStorage : noopStorage
  }),
  ssr: true
})

export const kitConfig: KitConfig = {
  projectAccessKey,
  defaultTheme: 'dark',
  signIn: {
    projectName: 'Kit Demo',
    // logoUrl: 'sw-logo-white.svg',
    useMock: isDebugMode
  },
  displayedAssets: [
    // Native token
    {
      contractAddress: zeroAddress,
      chainId: arbitrumNova.id
    },
    // Native token
    {
      contractAddress: zeroAddress,
      chainId: arbitrumSepolia.id
    },
    // Waas demo NFT
    {
      contractAddress: '0x0d402c63cae0200f0723b3e6fa0914627a48462e',
      chainId: arbitrumNova.id
    },
    // Waas demo NFT
    {
      contractAddress: '0x0d402c63cae0200f0723b3e6fa0914627a48462e',
      chainId: arbitrumSepolia.id
    },
    // Skyweaver assets
    {
      contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
      chainId: polygon.id
    }
  ]
}

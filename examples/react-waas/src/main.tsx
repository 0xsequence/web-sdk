import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { Chain, arbitrumNova, arbitrumSepolia, mainnet, polygon } from 'wagmi/chains'
import { sequence } from '0xsequence'
import { getDefaultWaasConnectors } from '@0xsequence/kit-connectors'
import { KitConfig, KitProvider } from '@0xsequence/kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const chains: readonly [Chain, ...Chain[]] = [arbitrumNova as Chain, arbitrumSepolia as Chain, mainnet as Chain, polygon as Chain]

// replace with your keys, and better to use env vars
const projectAccessKey = 'T3czhtWsTONJpbjFgAdLAuEAAAAAAAAA'
const waasConfigKey = 'eyJwcm9qZWN0SWQiOjc1LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0='
const googleClientId = '603294233249-6h5saeg2uiu8akpcbar3r2aqjp6j7oem.apps.googleusercontent.com'
// const appleClientId =
// const appleRedirectURI = 'https://' + window.location.host

const connectors = [
  ...getDefaultWaasConnectors({
    walletConnectProjectId: 'c65a6cb1aa83c4e24500130f23a437d8',
    defaultChainId: 421614,
    waasConfigKey,
    googleClientId,
    // appleClientId,
    // appleRedirectURI,
    appName: 'Kit Demo',
    projectAccessKey
  })
]

/* @ts-expect-error-next-line */
const transports: Record<number, HttpTransport> = {}

chains.forEach(chain => {
  const network = sequence.network.findNetworkConfig(sequence.network.allNetworks, chain.id)
  if (!network) return

  transports[chain.id] = http(network.rpcUrl)
})

const config = createConfig({
  transports,
  chains,
  connectors
})

const kitConfig: KitConfig = {
  defaultTheme: 'dark',
  signIn: {
    projectName: 'Kit Demo'
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <KitProvider config={kitConfig}>
          <App />
        </KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)

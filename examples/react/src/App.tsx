import { sequence } from '0xsequence'
import { ethers } from 'ethers'
import qs from 'query-string'
import { ThemeProvider } from '@0xsequence/design-system'
import { KitProvider, KitConfig, getKitConnectWallets } from '@0xsequence/kit'
import { getDefaultConnectors, getDefaultWaasConnectors, mock } from '@0xsequence/kit-connectors'
import { KitWalletProvider } from '@0xsequence/kit-wallet'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import Homepage from './components/Homepage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Chain } from 'viem'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { arbitrumNova, arbitrumSepolia, mainnet, polygon } from 'wagmi/chains'

import '@0xsequence/design-system/styles.css'

const queryClient = new QueryClient()

function App() {
  // append ?debug=true to url to enable debug mode
  const { debug } = qs.parse(location.search)
  const isDebugMode = debug === 'true'

  /* typing error from wagmi? */
  const chains: readonly [Chain, ...Chain[]] = [
    arbitrumNova as Chain,
    arbitrumSepolia as Chain,
    mainnet as Chain,
    polygon as Chain
  ]

  const projectAccessKey = 'EeP6AmufRFfigcWaNverI6CAAAAAAAAAA'
  const waasConfigKey =
    'eyJwcm9qZWN0SWQiOjIsImVtYWlsUmVnaW9uIjoidXMtZWFzdC0yIiwiZW1haWxDbGllbnRJZCI6IjVncDltaDJmYnFiajhsNnByamdvNzVwMGY2IiwicnBjU2VydmVyIjoiaHR0cHM6Ly9uZXh0LXdhYXMuc2VxdWVuY2UuYXBwIn0='
  const googleClientId = '970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com'
  const appleClientId = 'com.horizon.sequence.waas'
  const appleRedirectURI = 'https://strong-pavlova-dcf6f0.netlify.app'

  const connectors = [
    ...getDefaultWaasConnectors({
      walletConnectProjectId: 'c65a6cb1aa83c4e24500130f23a437d8',
      defaultChainId: 42170,
      waasConfigKey,
      googleClientId,
      appleClientId,
      appleRedirectURI,
      appName: 'Kit Demo',
      projectAccessKey,
      enableConfirmationModal: true
    }),
    ...(isDebugMode
      ? getKitConnectWallets(projectAccessKey, [
          mock({
            accounts: ['0xCb88b6315507e9d8c35D81AFB7F190aB6c3227C9']
          })
        ])
      : [])
  ]

  // const connectors = [
  //   ...getDefaultConnectors({
  //     walletConnectProjectId: 'c65a6cb1aa83c4e24500130f23a437d8',
  //     defaultChainId: 137,
  //     appName: 'demo app',
  //     projectAccessKey
  //   }),
  //   ...(isDebugMode
  //     ? getKitConnectWallets(projectAccessKey, [
  //         mock({
  //           accounts: ['0xCb88b6315507e9d8c35D81AFB7F190aB6c3227C9']
  //         })
  //       ])
  //     : [])
  // ]

  const transports = {}

  chains.forEach(chain => {
    const network = sequence.network.findNetworkConfig(sequence.network.allNetworks, chain.id)
    if (!network) return
    transports[chain.id] = http(network.rpcUrl)
  })

  const config = createConfig({
    transports,
    chains,
    /* TODO: check connector typings. Might be related to wagmi problem */
    /* @ts-ignore-next-line */
    connectors
  })

  const kitConfig: KitConfig = {
    defaultTheme: 'dark',
    signIn: {
      projectName: 'Kit Demo',
      // logoUrl: 'sw-logo-white.svg',
      useMock: isDebugMode
    },
    displayedAssets: [
      // Native token
      {
        contractAddress: ethers.constants.AddressZero,
        chainId: 42170
      },
      // Skyweaver assets
      {
        contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
        chainId: 137
      }
    ]
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <KitProvider config={kitConfig}>
          <KitWalletProvider>
            <KitCheckoutProvider>
              <div id="app">
                <ThemeProvider root="#app" scope="app" theme="dark">
                  <Homepage />
                </ThemeProvider>
              </div>
            </KitCheckoutProvider>
          </KitWalletProvider>
        </KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

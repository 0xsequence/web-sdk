import { useState } from 'react'
import { SequenceConnectProvider, getSequenceConnectWallets, THEMES } from '@0xsequence/kit-core'
import { sequence, metamask, injected, walletConnect } from '@0xsequence/kit-connectors'
import { SequenceConnectWalletProvider } from '@0xsequence/kit-wallet'
import Homepage from './components/Homepage'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { mainnet, polygon } from 'wagmi/chains'

import { ModalThemeContext } from './contexts'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const { chains, provider, webSocketProvider } = configureChains(
    [mainnet, polygon],
    [publicProvider()],
  )

  const connectors = getSequenceConnectWallets([
    injected({
      chains
    }),
    sequence({
      chains,
      connect: {
        app: 'Sequence Kit example',
        networkId: 137
      }
    }),
    metamask({
      chains,
    }),
    walletConnect({
      chains,
      options: {
        projectId: 'c65a6cb1aa83c4e24500130f23a437d8'
      },
    })
  ])

  const client = createClient({
    autoConnect: true,
    provider,
    webSocketProvider,
    connectors
  })

  return (
    <WagmiConfig client={client}>
      <SequenceConnectProvider theme={isDarkMode ? THEMES.dark : THEMES.light}>
        <SequenceConnectWalletProvider theme={isDarkMode ? THEMES.dark : THEMES.light}>
          <ModalThemeContext.Provider value={{ setIsDarkMode, isDarkMode }}>
            <Homepage />
          </ModalThemeContext.Provider>
        </SequenceConnectWalletProvider>
      </SequenceConnectProvider>
    </WagmiConfig>
  );
}

export default App;

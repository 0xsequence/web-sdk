import '@0xsequence/design-system/styles.css'

import { ThemeProvider } from '@0xsequence/design-system'
import { KitProvider } from '@0xsequence/kit'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import { KitWalletProvider } from '@0xsequence/kit-wallet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { Homepage } from './components/Homepage'
import { kitConfig, wagmiConfig } from './config'

const queryClient = new QueryClient()

export const App = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
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

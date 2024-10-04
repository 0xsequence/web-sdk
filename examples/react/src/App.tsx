import '@0xsequence/kit/styles.css'

import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceKit } from '@0xsequence/kit'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import { KitWalletProvider } from '@0xsequence/kit-wallet'

import { Homepage } from './components/Homepage'
import { config } from './config'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceKit config={config}>
        <KitWalletProvider>
          <KitCheckoutProvider>
            <Homepage />
          </KitCheckoutProvider>
        </KitWalletProvider>
      </SequenceKit>
    </ThemeProvider>
  )
}

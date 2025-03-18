import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'

import { Homepage } from './components/Homepage'
import { config, checkoutConfig } from './config'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceConnect config={config}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider config={checkoutConfig}>
            <Homepage />
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}

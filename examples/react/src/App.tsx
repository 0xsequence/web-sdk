import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceCheckoutProvider } from '@0xsequence/web-sdk-checkout'
import { SequenceConnect } from '@0xsequence/web-sdk-connect'
import { SequenceWalletProvider } from '@0xsequence/web-sdk-wallet'

import { Homepage } from './components/Homepage'
import { config } from './config'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceConnect config={config}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider>
            <Homepage />
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}

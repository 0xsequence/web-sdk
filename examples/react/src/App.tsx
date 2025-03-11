import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceCheckoutProvider } from '@0xsequence/web-sdk-checkout'
import { SequenceKit } from '@0xsequence/web-sdk-connect'
import { SequenceWalletProvider } from '@0xsequence/web-sdk-wallet'

import { Homepage } from './components/Homepage'
import { config } from './config'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceKit config={config}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider>
            <Homepage />
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceKit>
    </ThemeProvider>
  )
}

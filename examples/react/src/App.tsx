import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceCheckoutProvider } from '@0xsequence/react-checkout'
import { SequenceConnect } from '@0xsequence/react-connect'
import { SequenceWalletProvider } from '@0xsequence/react-wallet'

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

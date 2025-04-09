import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Homepage } from './components/Homepage'
import { ImmutableCallback } from './components/ImmutableCallback'
import { config, checkoutConfig } from './config'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceConnect config={config}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider config={checkoutConfig}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/auth-callback" element={<ImmutableCallback />} />
              </Routes>
            </BrowserRouter>
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}

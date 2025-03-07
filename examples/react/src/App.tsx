import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { ThemeProvider } from '@0xsequence/design-system'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'

import { Homepage } from './components/Homepage'
import { config } from './config'
import { ImmutableCallback } from './components/ImmutableCallback'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceConnect config={config}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider>
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/auth/callback" element={<ImmutableCallback />} />
              </Routes>
            </BrowserRouter>
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}

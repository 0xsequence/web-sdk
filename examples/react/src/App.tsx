import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Homepage } from './components/Homepage'
import { ImmutableCallback } from './components/ImmutableCallback'
import { checkoutConfig, config } from './config'

export const App = () => {
  return (
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
  )
}

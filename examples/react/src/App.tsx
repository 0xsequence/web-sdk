import '@0xsequence/kit/styles.css'

import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceKit } from '@0xsequence/kit'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import { KitWalletProvider } from '@0xsequence/kit-wallet'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Homepage } from './components/Homepage'
import { config } from './config'
import { ImmutableCallback } from './components/ImmutableCallback'

export const App = () => {
  return (
    <ThemeProvider theme="dark">
      <SequenceKit config={config}>
        <KitWalletProvider>
          <KitCheckoutProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/auth/callback" element={<ImmutableCallback />} />
              </Routes>
            </BrowserRouter>
          </KitCheckoutProvider>
        </KitWalletProvider>
      </SequenceKit>
    </ThemeProvider>
  )
}

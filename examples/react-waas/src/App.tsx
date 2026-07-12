import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { Homepage } from './components/Homepage'
import { InlineDemo } from './components/InlineDemo'
import { XAuthCallback } from './components/XAuthCallback'
import { checkoutConfig, config } from './config'

export const App = () => {
  const [useFullWidthSocials, setUseFullWidthSocials] = useState(config.connectConfig.signIn?.descriptiveSocials ?? false)
  const demoConfig = useMemo(
    () => ({
      ...config,
      connectConfig: {
        ...config.connectConfig,
        signIn: {
          ...config.connectConfig.signIn,
          descriptiveSocials: useFullWidthSocials
        }
      }
    }),
    [useFullWidthSocials]
  )

  return (
    <ThemeProvider defaultTheme="dark">
      <SequenceConnect config={demoConfig}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider config={checkoutConfig}>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Homepage useFullWidthSocials={useFullWidthSocials} onUseFullWidthSocialsChange={setUseFullWidthSocials} />
                  }
                />
                <Route path="/inline" element={<InlineDemo />} />
                <Route path="/auth-callback-X" element={<XAuthCallback />} />
              </Routes>
            </BrowserRouter>
          </SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}

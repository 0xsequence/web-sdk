import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'
import { useCallback, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Homepage } from './components/Homepage'
import { ImmutableCallback } from './components/ImmutableCallback'
import { InlineDemo } from './components/InlineDemo'
import { XAuthCallback } from './components/XAuthCallback'
import { checkoutConfig, createExampleConfig, loadWalletUrl, persistWalletUrl, sanitizeWalletUrl } from './config'

export const App = () => {
  const [walletUrl, setWalletUrl] = useState<string>(() => loadWalletUrl())

  const handleWalletUrlChange = useCallback((nextUrl: string) => {
    const sanitizedUrl = sanitizeWalletUrl(nextUrl)
    persistWalletUrl(sanitizedUrl)
    setWalletUrl(sanitizedUrl)
  }, [])

  const config = useMemo(() => createExampleConfig(walletUrl), [walletUrl])

  return (
    <SequenceConnect config={config}>
      <SequenceWalletProvider>
        <SequenceCheckoutProvider config={checkoutConfig}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Homepage walletUrl={walletUrl} onWalletUrlChange={handleWalletUrlChange} />} />
              <Route path="/inline" element={<InlineDemo config={config} />} />
              <Route path="/auth-callback" element={<ImmutableCallback />} />
              <Route path="/auth-callback-X" element={<XAuthCallback />} />
            </Routes>
          </BrowserRouter>
        </SequenceCheckoutProvider>
      </SequenceWalletProvider>
    </SequenceConnect>
  )
}

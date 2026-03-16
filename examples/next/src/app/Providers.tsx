'use client'

import { SequenceCheckoutProvider } from '@0xsequence/checkout'
import { SequenceConnect } from '@0xsequence/connect'
import { ThemeProvider } from '@0xsequence/design-system'
import { SequenceWalletProvider } from '@0xsequence/wallet-widget'
import { State } from 'wagmi'

import { checkoutConfig, config } from '../config'

export interface ProvidersProps {
  children: React.ReactNode
  initialState?: State | undefined
}

export const Providers = (props: ProvidersProps) => {
  const { children, initialState } = props

  return (
    <ThemeProvider defaultTheme="dark">
      <SequenceConnect config={config} initialState={initialState}>
        <SequenceWalletProvider>
          <SequenceCheckoutProvider config={checkoutConfig}>{children}</SequenceCheckoutProvider>
        </SequenceWalletProvider>
      </SequenceConnect>
    </ThemeProvider>
  )
}

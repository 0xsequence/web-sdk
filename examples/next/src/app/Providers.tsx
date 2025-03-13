'use client'

import { SequenceCheckoutProvider } from '@0xsequence/react-checkout'
import { SequenceConnect } from '@0xsequence/react-connect'
import { SequenceWalletProvider } from '@0xsequence/react-wallet'
import { State } from 'wagmi'

import { config } from '../config'

export interface ProvidersProps {
  children: React.ReactNode
  initialState?: State | undefined
}

export const Providers = (props: ProvidersProps) => {
  const { children, initialState } = props

  return (
    <SequenceConnect config={config} initialState={initialState}>
      <SequenceWalletProvider>
        <SequenceCheckoutProvider>{children}</SequenceCheckoutProvider>
      </SequenceWalletProvider>
    </SequenceConnect>
  )
}

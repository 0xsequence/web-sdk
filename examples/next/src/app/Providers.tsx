'use client'

import { SequenceCheckoutProvider } from '@0xsequence/web-sdk-checkout'
import { SequenceKit } from '@0xsequence/web-sdk-connect'
import { SequenceWalletProvider } from '@0xsequence/web-sdk-wallet'
import { State } from 'wagmi'

import { config } from '../config'

export interface ProvidersProps {
  children: React.ReactNode
  initialState?: State | undefined
}

export const Providers = (props: ProvidersProps) => {
  const { children, initialState } = props

  return (
    <SequenceKit config={config} initialState={initialState}>
      <SequenceWalletProvider>
        <SequenceCheckoutProvider>{children}</SequenceCheckoutProvider>
      </SequenceWalletProvider>
    </SequenceKit>
  )
}

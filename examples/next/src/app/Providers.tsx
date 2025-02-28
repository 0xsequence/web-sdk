'use client'

import { SequenceKit } from '@0xsequence/kit'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import { KitWalletProvider } from '@0xsequence/kit-wallet'
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
      <KitWalletProvider>
        <KitCheckoutProvider>{children}</KitCheckoutProvider>
      </KitWalletProvider>
    </SequenceKit>
  )
}

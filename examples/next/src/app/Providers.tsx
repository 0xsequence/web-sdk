'use client'

import { KitProvider } from '@0xsequence/kit'
import { KitCheckoutProvider } from '@0xsequence/kit-checkout'
import { KitWalletProvider } from '@0xsequence/kit-wallet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig, kitConfig } from '../config'

const queryClient = new QueryClient()

export interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = (props: ProvidersProps) => {
  const { children } = props

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <KitProvider config={kitConfig}>
          <KitWalletProvider>
            <KitCheckoutProvider>{children}</KitCheckoutProvider>
          </KitWalletProvider>
        </KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

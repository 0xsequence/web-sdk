import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider, type State } from 'wagmi'

import type { SequenceConnectConfig } from '../../config/createConfig.js'
import { SequenceConnectInlineProvider } from '../SequenceConnectInlineProvider/SequenceConnectInlineProvider.js'

const defaultQueryClient = new QueryClient()

export interface SequenceConnectInlineProps {
  config: SequenceConnectConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children?: ReactNode
}

/**
 * Inline version of SequenceConnect component.
 * This component renders the connect UI inline within your layout instead of in a modal.
 * Ideal for embedded wallet experiences or custom layouts.
 */
export const SequenceConnectInline = (props: SequenceConnectInlineProps) => {
  const { config, queryClient, initialState, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceConnectInlineProvider config={connectConfig}>{children}</SequenceConnectInlineProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

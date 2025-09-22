import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider, type State } from 'wagmi'

import type { SequenceConnectConfig } from '../../config/createConfig.js'
import { SequenceConnectPreviewProvider } from '../SequenceConnectPreviewProvider/SequenceConnectPreviewProvider.js'

const defaultQueryClient = new QueryClient()

interface SequenceConnectPreviewProps {
  config: SequenceConnectConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: ReactNode
}

/**
 * @internal
 * Preview version of SequenceConnect component.
 * This component should only be used for testing purposes.
 * It provides the same functionality as SequenceConnect but only for preview purposes.
 */
export const SequenceConnectPreview = (props: SequenceConnectPreviewProps) => {
  const { config, queryClient, initialState, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceConnectPreviewProvider
          config={{
            ...connectConfig,
            hideConnectedWallets: true
          }}
        >
          {children}
        </SequenceConnectPreviewProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

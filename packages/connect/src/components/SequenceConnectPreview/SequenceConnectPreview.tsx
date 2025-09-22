import { SequenceHooksProvider } from '@0xsequence/hooks'
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

export const SequenceConnectPreview = (props: SequenceConnectPreviewProps) => {
  const { config, queryClient, initialState, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceHooksProvider
          config={{
            projectAccessKey: config.connectConfig.projectAccessKey
          }}
        >
          <SequenceConnectPreviewProvider config={connectConfig}>{children}</SequenceConnectPreviewProvider>
        </SequenceHooksProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

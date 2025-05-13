import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider, type State } from 'wagmi'

import type { SequenceConnectConfig } from '../../config/createConfig.js'
import { SequenceConnectProvider } from '../SequenceConnectProvider/index.js'

const defaultQueryClient = new QueryClient()

interface SequenceConnectProps {
  config: SequenceConnectConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: ReactNode
}

export const SequenceConnect = (props: SequenceConnectProps) => {
  const { config, queryClient, initialState, children } = props
  const { connectConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <SequenceConnectProvider config={connectConfig}>{children}</SequenceConnectProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

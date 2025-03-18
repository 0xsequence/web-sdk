import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

import { SequenceConnectConfig } from '../../config/createConfig'
import { SequenceConnectProvider } from '../SequenceConnectProvider'

const defaultQueryClient = new QueryClient()

interface SequenceConnectProps {
  config: SequenceConnectConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: React.ReactNode
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider } from 'wagmi'

import { SequenceKitConfig } from '../../config/createConfig'
import { KitProvider } from '../KitProvider'

const defaultQueryClient = new QueryClient()

interface SequenceKitProps {
  config: SequenceKitConfig
  queryClient?: QueryClient
  initialState?: State | undefined
  children: React.ReactNode
}

export const SequenceKit = (props: SequenceKitProps) => {
  const { config, queryClient, children } = props
  const { kitConfig, wagmiConfig } = config

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <KitProvider config={kitConfig}>{children}</KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

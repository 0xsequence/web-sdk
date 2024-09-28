import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Config, WagmiProvider } from 'wagmi'

import { KitConfig } from '../../types'
import { KitProvider } from '../KitProvider'

const defaultQueryClient = new QueryClient()

interface SequenceKitProps {
  wagmiConfig: Config
  kitConfig: KitConfig
  queryClient?: QueryClient
  children: React.ReactNode
}

export const SequenceKit = (props: SequenceKitProps) => {
  const { wagmiConfig, kitConfig, queryClient, children } = props

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <KitProvider config={kitConfig}>{children}</KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

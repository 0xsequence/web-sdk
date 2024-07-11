import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Config, WagmiProvider } from 'wagmi'

import { KitConfig } from '../../types'
import { KitProvider } from '../KitProvider'

const defaultQueryClient = new QueryClient()

// Combined Wagmi and Kit Config
export type SequenceKitConfig = Config &
  KitConfig & {
    queryClient?: QueryClient
  }

export const SequenceKit = (props: { config: SequenceKitConfig; children: React.ReactNode }) => {
  const { config, children } = props
  const {
    queryClient,
    projectAccessKey,
    disableAnalytics,
    defaultTheme,
    position,
    signIn,
    displayedAssets,
    ethAuth,
    isDev,
    ...wagmiConfig
  } = config

  const kitConfig: KitConfig = {
    projectAccessKey,
    disableAnalytics,
    defaultTheme,
    position,
    signIn,
    displayedAssets,
    ethAuth,
    isDev
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient || defaultQueryClient}>
        <KitProvider config={kitConfig}>{children}</KitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

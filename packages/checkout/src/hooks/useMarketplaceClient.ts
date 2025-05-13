import { useProjectAccessKey } from '@0xsequence/connect'
import { MarketplaceIndexer } from '@0xsequence/marketplace'
import { networks } from '@0xsequence/network'
import { useMemo } from 'react'

import { useEnvironmentContext } from '../contexts/Environment.js'

export interface UseMarketplaceClientArgs {
  chain: ChainNameOrId
}

export const useMarketplaceClient = ({ chain }: UseMarketplaceClientArgs) => {
  const projectAccessKey = useProjectAccessKey()
  const { marketplaceApiUrl } = useEnvironmentContext()

  const marketplaceClient = useMemo(() => {
    const network = getNetwork(chain).name

    const clientUrl = `${marketplaceApiUrl}/${network}`
    return new MarketplaceIndexer(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return marketplaceClient
}

type ChainNameOrId = string | number

const getNetwork = (nameOrId: ChainNameOrId) => {
  for (const network of Object.values(networks)) {
    if (network.name === String(nameOrId).toLowerCase() || network.chainId === Number(nameOrId)) {
      return network
    }
  }
  throw new Error(`Unsopported chain; ${nameOrId}`)
}

import { useProjectAccessKey } from '@0xsequence/kit'
import { MarketplaceIndexer } from '@0xsequence/marketplace'
import { useMemo } from 'react'


export const useMarketplaceClient = () => {
  const projectAccessKey = useProjectAccessKey()

  // TODO: move to env variable
  const isDev = false

  const marketplaceClient = useMemo(() => {
    const clientUrl = isDev ? 'https://dev-marketplace-api.sequence-dev.app' : 'https://marketplace-api.sequence.app'

    return new MarketplaceIndexer(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return marketplaceClient
}

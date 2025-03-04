import { GetTokenMetadataArgs, SequenceMetadata } from '@0xsequence/metadata'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { splitEvery } from '../../utils/helpers'
import { useConfig } from '../useConfig'

import { useMetadataClient } from './useMetadataClient'

const getTokenMetadata = async (metadataClient: SequenceMetadata, args: GetTokenMetadataArgs, imageProxyUrl: string) => {
  const { chainID, contractAddress, tokenIDs } = args

  // metadata api has a "50 tokenID request limit per contract" rate limit
  const tokenIDChunks = splitEvery(50, tokenIDs)

  const metadataResults = await Promise.all(
    tokenIDChunks.map(tokenIDs =>
      metadataClient.getTokenMetadata({
        chainID: chainID,
        contractAddress: contractAddress,
        tokenIDs: tokenIDs
      })
    )
  )

  const data = metadataResults.map(mr => mr.tokenMetadata).flat()

  data.forEach(d => {
    if (d?.image) {
      d.image = `${imageProxyUrl}${d.image}`
    }
  })

  return data
}

/**
 * @description Gets the token metadata for a given chainId and contractAddress (optional tokenIds for a more granular search)
 */
export const useGetTokenMetadata = (getTokenMetadataArgs: GetTokenMetadataArgs, options?: HooksOptions) => {
  const { env } = useConfig()
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetTokenMetadata, getTokenMetadataArgs, options],
    queryFn: () => getTokenMetadata(metadataClient, getTokenMetadataArgs, env.imageProxyUrl),
    retry: options?.retry ?? true,
    staleTime: time.oneHour,
    enabled: !!getTokenMetadataArgs.chainID && !!getTokenMetadataArgs.contractAddress && !options?.disabled
  })
}

import { useQuery } from '@tanstack/react-query'

import { time } from '../constants/hooks'
import { splitEvery } from '../utils/helpers'
import { useConfig } from './useConfig'
import { useMetadataClient } from './useMetadataClient'

import { GetTokenMetadataArgs, GetTokenMetadataReturn, SequenceMetadata } from '@0xsequence/metadata'

const getTokenMetadata = async (
  metadataClient: SequenceMetadata,
  args: GetTokenMetadataArgs,
  imageProxyUrl: string
): Promise<GetTokenMetadataReturn> => {
  try {
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
    return { tokenMetadata: data }
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const useGetTokenMetadata = (
  getTokenMetadataArgs: GetTokenMetadataArgs,
  options?: { disabled?: boolean; retry?: boolean }
) => {
  const { env } = useConfig()
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: ['tokenMetadata', getTokenMetadataArgs, options],
    queryFn: () => getTokenMetadata(metadataClient, getTokenMetadataArgs, env.imageProxyUrl),
    retry: options?.retry ?? true,
    staleTime: time.oneHour,
    enabled: !!getTokenMetadataArgs.chainID && !!getTokenMetadataArgs.contractAddress && !options?.disabled
  })
}

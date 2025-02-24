import { useQuery } from '@tanstack/react-query'

import { time } from '../constants/hooks'
import { useMetadataClient } from './useMetadataClient'

import { ContractInfo, SequenceMetadata } from '@0xsequence/metadata'
import { GetContractInfoArgs } from '@0xsequence/metadata'

export const getCollectionsMetadata = async (
  metadataClient: SequenceMetadata,
  arg: GetContractInfoArgs[]
): Promise<ContractInfo[]> => {
  try {
    const res = await Promise.all(arg.map(a => metadataClient.getContractInfo(a)))

    return res.map(r => r.contractInfo)
  } catch (e) {
    throw e
  }
}

export const useGetCollectionsMetadata = (
  useGetCollectionsMetadataArgs: GetContractInfoArgs[],
  options?: { disabled?: boolean; retry?: boolean }
) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: ['collectionsMetadata', useGetCollectionsMetadataArgs, options],
    queryFn: async () => await getCollectionsMetadata(metadataClient, useGetCollectionsMetadataArgs),
    retry: options?.retry ?? true,
    staleTime: time.oneHour,
    enabled: !options?.disabled
  })
}

import { ContractInfo, SequenceMetadata, GetContractInfoArgs } from '@0xsequence/metadata'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, time } from '../../constants'
import { HooksOptions } from '../../types'

import { useMetadataClient } from './useMetadataClient'

const getMultipleContractsInfo = async (
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

/**
 * @description Gets a list of contract info for a list of chainId and contractAddress pairs
 */
export const useGetMultipleContractsInfo = (useGetMultipleContractsInfoArgs: GetContractInfoArgs[], options?: HooksOptions) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetMultipleContractInfo, useGetMultipleContractsInfoArgs, options],
    queryFn: async () => await getMultipleContractsInfo(metadataClient, useGetMultipleContractsInfoArgs),
    retry: options?.retry ?? true,
    staleTime: time.oneHour,
    enabled: !options?.disabled
  })
}
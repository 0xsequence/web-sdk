import { useQuery } from '@tanstack/react-query'

import { ZERO_ADDRESS, time } from '../constants/hooks'
import { compareAddress } from '../utils/helpers'
import { useMetadataClient } from './useMetadataClient'

import { GetContractInfoArgs } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'

export const useGetContractInfo = (
  getContractInfoArgs: GetContractInfoArgs,
  options?: { disabled?: boolean; retry?: boolean }
) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: ['contractInfo', getContractInfoArgs, options],
    queryFn: async () => {
      const isNativeToken = compareAddress(ZERO_ADDRESS, getContractInfoArgs.contractAddress)

      const res = await metadataClient.getContractInfo(getContractInfoArgs)
      const network = findSupportedNetwork(getContractInfoArgs.chainID)

      return {
        ...res.contractInfo,
        ...(isNativeToken && network
          ? {
              ...network.nativeToken,
              logoURI: network.logoURI
            }
          : {})
      }
    },
    retry: options?.retry ?? true,
    staleTime: time.oneMinute * 10,
    enabled: !!getContractInfoArgs.chainID && !!getContractInfoArgs.contractAddress && !options?.disabled
  })
}

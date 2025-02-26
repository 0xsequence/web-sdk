import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS, ZERO_ADDRESS, time } from '../../constants'
import { HooksOptions } from '../../types'
import { compareAddress } from '../../utils/helpers'
import { useMetadataClient } from './useMetadataClient'

import { ContractInfo, SequenceMetadata } from '@0xsequence/metadata'
import { findSupportedNetwork } from '@0xsequence/network'

const getCurrencyInfo = async (metadataClient: SequenceMetadata, args: GetCurrencyInfoArgs) => {
  const network = findSupportedNetwork(args.chainId)

  const isNativeToken = compareAddress(args.currencyAddress, ZERO_ADDRESS)

  if (isNativeToken) {
    return {
      ...network?.nativeToken,
      logoURI: network?.logoURI || '',
      address: ZERO_ADDRESS
    } as ContractInfo
  }

  const res = await metadataClient.getContractInfo({
    chainID: String(args.chainId),
    contractAddress: args.currencyAddress
  })

  if (res.contractInfo) {
    return {
      ...res.contractInfo
    }
  }
}

export interface GetCurrencyInfoArgs {
  chainId: number
  currencyAddress: string
}

export const useGetCurrencyInfo = (args: GetCurrencyInfoArgs, options?: HooksOptions) => {
  const metadataClient = useMetadataClient()

  return useQuery({
    queryKey: [QUERY_KEYS.useGetCurrencyInfo, args, options],
    queryFn: async () => getCurrencyInfo(metadataClient, args),
    retry: options?.retry ?? true,
    staleTime: time.oneMinute * 10,
    enabled: !!args.chainId && !!args.currencyAddress && !options?.disabled
  })
}

import { getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { compareAddress, Image, Skeleton, Text } from '@0xsequence/design-system'
import { useGetSingleTokenBalance } from '@0xsequence/hooks'
import { zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import type { TokenInfo } from '../index.js'

export const TokenHeader = ({ contractAddress, chainId, accountAddress }: TokenInfo) => {
  const { chains } = useConfig()
  const { data: tokenData } = useGetSingleTokenBalance({
    chainId,
    contractAddress,
    accountAddress: accountAddress ?? ''
  })

  const isNativeToken = compareAddress(contractAddress, zeroAddress)
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)

  const logoURI = isNativeToken ? nativeTokenInfo.logoURI : tokenData?.contractInfo?.logoURI
  const name = isNativeToken ? nativeTokenInfo.symbol : tokenData?.contractInfo?.name

  return (
    <div className="flex flex-row items-center h-full w-full">
      <div className="px-3">
        {logoURI ? (
          <Image
            className="w-9 h-9 rounded-lg"
            src={logoURI}
            alt={name}
            style={{
              objectFit: 'cover'
            }}
          />
        ) : (
          <Skeleton className="w-9 h-9 rounded-full" />
        )}
      </div>

      <div className="flex flex-col">
        <Text
          variant="medium"
          color="primary"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {name}
        </Text>
      </div>
    </div>
  )
}

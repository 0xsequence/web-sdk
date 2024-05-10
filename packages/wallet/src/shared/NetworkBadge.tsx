import React from 'react'
import { Box, NetworkImage, Text } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, getNetwork, getNetworkColor, getNetworkBackgroundColor } from '@0xsequence/kit'
import { useConfig } from 'wagmi'

import { capitalize } from '../utils'

interface NetworkBadgeProps {
  chainId: number
}

export const NetworkBadge = ({ chainId }: NetworkBadgeProps) => {
  const { chains } = useConfig()
  const network = getNetwork(chainId)
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const chainColor = getNetworkColor(chainId)
  const chainBGColor = getNetworkBackgroundColor(chainId)

  return (
    <Box
      height="6"
      paddingY="1"
      paddingLeft="1.5"
      paddingRight="2"
      gap="1"
      style={{
        background: chainBGColor
      }}
      borderRadius="xs"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      width="fit"
    >
      <NetworkImage chainId={chainId} size="xs" />
      <Text
        fontWeight="bold"
        fontSize="xsmall"
        style={{
          color: chainColor
        }}
      >
        {capitalize(network.title ?? network.name)}
      </Text>
    </Box>
  )
}

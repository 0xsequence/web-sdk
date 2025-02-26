import React from 'react'

import { getNetwork, getNetworkBackgroundColor, getNetworkColor } from '../../utils/networks'

import { Box, NetworkImage, Text } from '@0xsequence/design-system'

interface NetworkBadgeProps {
  chainId: number
}

export const NetworkBadge = ({ chainId }: NetworkBadgeProps) => {
  const network = getNetwork(chainId)
  const chainColor = getNetworkColor(chainId)
  const chainBGColor = getNetworkBackgroundColor(chainId)

  return (
    <Box
      height="6"
      paddingX="2"
      gap="1"
      borderRadius="xs"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      width="fit"
      style={{
        background: chainBGColor
      }}
    >
      <NetworkImage chainId={chainId} size="xs" />
      <Text
        variant="xsmall"
        fontWeight="bold"
        style={{
          color: chainColor
        }}
        capitalize
        ellipsis
      >
        {network.title ?? network.name}
      </Text>
    </Box>
  )
}

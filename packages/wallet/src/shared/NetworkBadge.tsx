import { Box, NetworkImage, Text } from '@0xsequence/design-system'
import { getNetwork, getNetworkColor, getNetworkBackgroundColor } from '@0xsequence/kit'
import React from 'react'

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
        variant="xsmall"
        fontWeight="bold"
        capitalize
        ellipsis
        style={{
          color: chainColor
        }}
      >
        {network.title ?? network.name}
      </Text>
    </Box>
  )
}

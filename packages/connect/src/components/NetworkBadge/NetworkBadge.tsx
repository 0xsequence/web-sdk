import { NetworkImage, Text } from '@0xsequence/design-system'
import React from 'react'

import { getNetwork, getNetworkBackgroundColor, getNetworkColor } from '../../utils/networks.js'

interface NetworkBadgeProps {
  chainId: number
}

export const NetworkBadge = ({ chainId }: NetworkBadgeProps) => {
  const network = getNetwork(chainId)
  const chainColor = getNetworkColor(chainId)
  const chainBGColor = getNetworkBackgroundColor(chainId)

  return (
    <div
      className="flex h-6 px-2 gap-1 rounded-sm flex-row justify-center items-center w-fit"
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
    </div>
  )
}

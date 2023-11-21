import React from 'react'
import { Box, Image, Text } from '@0xsequence/design-system'
import {
  getNativeTokenInfoByChainId,
  getChainColor,
  getChainBGColor,
  getNetworkConfigAndClients
} from '@0xsequence/kit'
import { useNetwork } from 'wagmi'

import { capitalize } from '../utils'

interface NetworkBadgeProps {
  chainId: number
}

export const NetworkBadge = ({
  chainId
}: NetworkBadgeProps) => {
  const { chains = [] }  = useNetwork()
  const { network } = getNetworkConfigAndClients(chainId)
  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)
  const chainColor = getChainColor(chainId)
  const chainBGColor = getChainBGColor(chainId)

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
      width="min"
    >
      <Image
        style={{ width: '14px' }}
        src={nativeTokenInfo.logoURI}
      />
      <Text
        fontWeight="bold"
        fontSize="xsmall"
        style={{
          color: chainColor
        }}
      >
        {capitalize(network.name)}
      </Text>
    </Box>
  )
}
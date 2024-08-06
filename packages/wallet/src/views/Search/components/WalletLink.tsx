import { Box, Text, ChevronRightIcon } from '@0xsequence/design-system'
import React from 'react'

import { Navigation } from '../../../contexts'
import { useNavigation } from '../../../hooks'

interface WalletLinkProps {
  toLocation: Navigation
  label: string
}

export const WalletLink = ({ toLocation, label }: WalletLinkProps) => {
  const { setNavigation } = useNavigation()

  const onClick = () => {
    setNavigation(toLocation)
  }

  return (
    <Box
      onClick={onClick}
      width="full"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      userSelect="none"
      cursor="pointer"
      opacity={{ hover: '80' }}
    >
      <Text variant="normal" color="text50" fontWeight="medium">
        {label}
      </Text>
      <Box flexDirection="row" justifyContent="center" alignItems="center">
        <Text variant="normal" color="text50" fontWeight="medium">
          View all
        </Text>
        <ChevronRightIcon color="text50" size="sm" />
      </Box>
    </Box>
  )
}

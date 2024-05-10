import { Box, Text, GradientAvatar, ChevronDownIcon } from '@0xsequence/design-system'
import React, { forwardRef } from 'react'
import { useAccount } from 'wagmi'

import { formatAddress } from '../../../utils'

interface AccountInformationProps {
  onClickAccount: () => void
}

export const AccountInformation = forwardRef(({ onClickAccount }: AccountInformationProps, ref) => {
  const { address } = useAccount()

  return (
    <Box gap="2" alignItems="center">
      <Box width="full" flexDirection="column" alignItems="center" justifyContent="center">
        <Box
          onClick={onClickAccount}
          gap="2"
          alignItems="center"
          justifyContent="center"
          position="relative"
          userSelect="none"
          cursor="pointer"
          opacity={{ hover: '80' }}
          // @ts-ignore-next-line
          ref={ref}
        >
          <GradientAvatar size="sm" address={address || ''} />
          <Text color="text100" fontWeight="medium" variant="normal">
            {formatAddress(address || '')}
          </Text>
          <ChevronDownIcon color="text100" />
        </Box>
      </Box>
    </Box>
  )
})

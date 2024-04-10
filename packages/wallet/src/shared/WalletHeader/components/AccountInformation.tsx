import React, { forwardRef } from 'react'

import { Box, Text, GradientAvatar, ChevronDownIcon } from '@0xsequence/design-system'

import { useAccount } from 'wagmi'

import { HEADER_HEIGHT } from '../../../constants'
import { formatAddress } from '../../../utils'
import * as styles from '../../styles.css'

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
          className={styles.clickable}
          position="relative"
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

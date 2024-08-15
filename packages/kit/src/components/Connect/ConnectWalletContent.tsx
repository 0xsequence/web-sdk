'use client'

import { Box, Text } from '@0xsequence/design-system'

import { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict'
import { KitConnectProviderProps } from '../KitProvider/KitProvider'

import { Connect } from './Connect'

interface ConnectWalletContent extends KitConnectProviderProps {
  emailConflictInfo?: FormattedEmailConflictInfo | null
  onClose: () => void
}

export const ConnectWalletContent = (props: ConnectWalletContent) => {
  const { emailConflictInfo, config } = props
  const projectName = config?.signIn?.projectName
  return (
    <Box padding="4">
      <Box
        justifyContent="center"
        color="text100"
        alignItems="center"
        fontWeight="medium"
        style={{
          marginTop: '4px'
        }}
      >
        <Text>Sign in {projectName ? `to ${projectName}` : ''}</Text>
      </Box>
      <Connect emailConflictInfo={emailConflictInfo} {...props} />
    </Box>
  )
}

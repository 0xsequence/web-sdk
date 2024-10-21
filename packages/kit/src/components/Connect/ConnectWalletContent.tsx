'use client'

import { Box, ModalPrimitive, Text } from '@0xsequence/design-system'

import { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict'
import { KitConnectProviderProps } from '../KitProvider/KitProvider'

import { Connect } from './Connect'

interface ConnectWalletContent extends KitConnectProviderProps {
  emailConflictInfo?: FormattedEmailConflictInfo | null
  onClose: () => void
  isPreview?: boolean
}

export const ConnectWalletContent = (props: ConnectWalletContent) => {
  const { emailConflictInfo, config, isPreview = false } = props
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
        <TitleWrapper isPreview={isPreview}>
          <Text>Sign in {projectName ? `to ${projectName}` : ''}</Text>
        </TitleWrapper>
      </Box>
      <Connect emailConflictInfo={emailConflictInfo} {...props} />
    </Box>
  )
}

const TitleWrapper = ({ children, isPreview }: { children: React.ReactNode; isPreview: boolean }) => {
  if (isPreview) {
    return <>{children}</>
  }

  return <ModalPrimitive.Title asChild>{children}</ModalPrimitive.Title>
}

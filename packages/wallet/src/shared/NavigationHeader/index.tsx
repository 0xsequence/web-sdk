import { Box, IconButton, ChevronLeftIcon, Text } from '@0xsequence/design-system'
import React from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation } from '../../hooks/useNavigation'

interface NavigationHeaderProps {
  primaryText?: string
  secondaryText?: string
}

export const NavigationHeader = ({ secondaryText, primaryText }: NavigationHeaderProps) => {
  const { goBack, history } = useNavigation()

  const onClickBack = () => {
    goBack()
  }

  return (
    <Box
      background="backgroundPrimary"
      zIndex="20"
      position="fixed"
      width="full"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingX="4"
      style={{
        height: HEADER_HEIGHT,
        paddingTop: '6px'
      }}
    >
      {history.length > 0 ? <IconButton onClick={onClickBack} icon={ChevronLeftIcon} size="xs" /> : <Box />}
      <Box>
        <Text fontWeight="medium" variant="small" color="text50">
          {secondaryText}
        </Text>
        <Text fontWeight="medium" variant="small" color="text100">
          {primaryText}
        </Text>
      </Box>
      <Box
        style={{
          width: '44px'
        }}
      />
    </Box>
  )
}

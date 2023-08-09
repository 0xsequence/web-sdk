import React from 'react'
import { Box, IconButton, ChevronLeftIcon, Text, vars } from '@0xsequence/design-system'
import { useNavigation } from '../../hooks/useNavigation'
import { HEADER_HEIGHT } from '../../constants'
import { Navigation } from '../../contexts/Navigation'

interface NavigationHeaderProps {
  backLocation: Navigation
  primaryText?: string
  secondaryText?: string
}

export const NavigationHeader = ({
  secondaryText,
  primaryText,
  backLocation
}: NavigationHeaderProps) => {
  const { setNavigation } = useNavigation()

  const onClickBack = () => {
    setNavigation(backLocation)
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
      style={{
        height: HEADER_HEIGHT,
        paddingTop: '6px',
        backgroundColor: vars.colors.backgroundPrimary
      }}
    >
      <IconButton
        onClick={onClickBack}
        icon={ChevronLeftIcon}
        size="sm"
        style={{ 
          background: 'rgba(0,0,0,0)',
          width: '44px',
        }}
      />
      <Box>
        <Text fontWeight="medium" variant="small" color="text50">
          {secondaryText}
        </Text>
        <Text fontWeight="medium" variant="small" color="text100">
          {primaryText}
        </Text>
      </Box>
      <Box style={{
        width: '44px'
      }} />
    </Box>    
  )
}
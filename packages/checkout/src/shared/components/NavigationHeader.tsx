import { Box, IconButton, ChevronLeftIcon, Text, vars, ModalPrimitive } from '@0xsequence/design-system'
import React from 'react'

import { HEADER_HEIGHT } from '../../constants'
import { useNavigation } from '../../hooks/useNavigation'

interface NavigationHeaderProps {
  primaryText?: string
  secondaryText?: string
  disableBack?: boolean
}

export const NavigationHeader = ({ secondaryText, primaryText, disableBack = false }: NavigationHeaderProps) => {
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
      style={{
        height: HEADER_HEIGHT,
        paddingTop: '6px',
        backgroundColor: vars.colors.backgroundPrimary,
        position: 'absolute'
      }}
    >
      {history.length > 0 && !disableBack ? (
        <IconButton
          onClick={onClickBack}
          icon={ChevronLeftIcon}
          size="sm"
          style={{
            background: 'rgba(0,0,0,0)',
            width: '44px'
          }}
        />
      ) : (
        <Box />
      )}
      <Box width="full" alignItems="center" justifyContent="center" style={{ marginLeft: '40px' }}>
        <Text fontWeight="medium" variant="small" color="text50">
          {secondaryText}
        </Text>
        <ModalPrimitive.Title asChild>
          <Text fontWeight="medium" variant="small" color="text100">
            {primaryText}
          </Text>
        </ModalPrimitive.Title>
      </Box>
      <Box
        style={{
          width: '44px'
        }}
      />
    </Box>
  )
}

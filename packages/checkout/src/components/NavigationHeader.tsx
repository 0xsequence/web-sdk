import { ChevronLeftIcon, IconButton, ModalPrimitive, Text } from '@0xsequence/design-system'
import React from 'react'

import { HEADER_HEIGHT } from '../constants'
import { useNavigation } from '../hooks/useNavigation'

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
    <div
      className="absolute flex bg-background-primary z-20 w-full flex-row items-center justify-between pt-1.5"
      style={{
        height: HEADER_HEIGHT
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
        <div />
      )}
      <div className="flex w-full items-center justify-center" style={{ marginLeft: '40px' }}>
        <Text fontWeight="medium" variant="small" color="muted">
          {secondaryText}
        </Text>
        <ModalPrimitive.Title asChild>
          <Text fontWeight="medium" variant="small" color="primary">
            {primaryText}
          </Text>
        </ModalPrimitive.Title>
      </div>
      <div
        style={{
          width: '44px'
        }}
      />
    </div>
  )
}

import { ChevronLeftIcon, IconButton, ModalPrimitive, Text } from '@0xsequence/design-system'
import React from 'react'

import { HEADER_HEIGHT } from '../constants/index.js'
import { useNavigationCheckout } from '../hooks/useNavigationCheckout.js'

interface NavigationHeaderProps {
  primaryText?: string
  secondaryText?: string
  disableBack?: boolean
}

export const NavigationHeaderCheckout = ({ secondaryText, primaryText, disableBack = false }: NavigationHeaderProps) => {
  const { goBack, history } = useNavigationCheckout()

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
      {history.length > 1 && !disableBack ? (
        <div className="bg-transparent w-[0px]">
          <IconButton onClick={onClickBack} icon={ChevronLeftIcon} size="sm" className="bg-transparent w-[44px]" />
        </div>
      ) : (
        <div />
      )}
      <div className="flex w-full items-center justify-center ml-[40px]">
        <Text fontWeight="medium" variant="small" color="muted">
          {secondaryText}
        </Text>
        <ModalPrimitive.Title asChild>
          <Text fontWeight="medium" variant="small" color="primary">
            {primaryText}
          </Text>
        </ModalPrimitive.Title>
      </div>
      <div className="w-[44px]" />
    </div>
  )
}

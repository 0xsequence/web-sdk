import { Card } from '@0xsequence/design-system'
import React, { ReactNode } from 'react'

import { SelectedIndicator } from './SelectedIndicator'

export interface SelectButtonProps extends BoxProps {
  children?: ReactNode
  className?: string
  onClick: (value: any) => void
  value: any
  selected: boolean
  disabled?: boolean
  hideIndicator?: boolean
  squareIndicator?: boolean
}

export const SelectButton = (props: SelectButtonProps) => {
  const { value, selected, children, disabled, onClick, className, hideIndicator, squareIndicator = false, ...rest } = props

  return (
    <Card
      className={`${className} flex select-none items-center justify-between text-left w-full border-none`}
      clickable
      disabled={disabled}
      style={{
        appearance: 'none'
      }}
      asChild
    >
      <button onClick={() => onClick(value)} {...rest}>
        {children}
        {!hideIndicator && <SelectedIndicator selected={selected} squareIndicator={squareIndicator} />}
      </button>
    </Card>
  )
}

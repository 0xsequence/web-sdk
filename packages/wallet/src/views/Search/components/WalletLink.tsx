import { Text, ChevronRightIcon } from '@0xsequence/design-system'
import React from 'react'

import { Navigation } from '../../../contexts'
import { useNavigation } from '../../../hooks'

interface WalletLinkProps {
  toLocation: Navigation
  label: string
}

export const WalletLink = ({ toLocation, label }: WalletLinkProps) => {
  const { setNavigation } = useNavigation()

  const onClick = () => {
    setNavigation(toLocation)
  }

  return (
    <div className="flex w-full flex-row justify-between items-center select-none cursor-pointer" onClick={onClick}>
      <Text variant="normal" color="muted" fontWeight="medium">
        {label}
      </Text>
      <div className="flex flex-row justify-center items-center">
        <Text variant="normal" color="muted" fontWeight="medium">
          View all
        </Text>
        <ChevronRightIcon className="text-muted" size="sm" />
      </div>
    </div>
  )
}

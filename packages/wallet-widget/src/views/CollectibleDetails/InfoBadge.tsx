import { Text } from '@0xsequence/design-system'
import type { ReactNode } from 'react'

export const InfoBadge = ({ leftIcon, label }: { leftIcon?: ReactNode; label: string }) => {
  return (
    <div className="flex flex-row bg-background-secondary h-7 py-1 px-2 gap-1 rounded-lg justify-center items-center w-fit">
      {leftIcon}
      <Text variant="small" color="muted">
        {label}
      </Text>
    </div>
  )
}

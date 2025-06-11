import { cn, Text } from '@0xsequence/design-system'
import type { ReactNode } from 'react'

export const InfoBadge = ({ leftIcon, label, onClick }: { leftIcon?: ReactNode; label: string; onClick?: () => void }) => {
  return (
    <div
      className={cn(
        'flex flex-row bg-background-secondary h-7 py-1 px-2 gap-1 rounded-lg justify-center items-center w-fit',
        onClick && 'cursor-pointer hover:opacity-80'
      )}
      onClick={onClick}
    >
      {leftIcon}
      <Text variant="small" color="muted">
        {label}
      </Text>
    </div>
  )
}

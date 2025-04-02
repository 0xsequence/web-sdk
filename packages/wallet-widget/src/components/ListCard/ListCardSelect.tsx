import { cn } from '@0xsequence/design-system'

import { RadioSelector } from './RadioSelector'

export const ListCardSelect = ({
  children,
  rightChildren,
  shape = 'rounded',
  style,
  type = 'radio',
  isSelected = false,
  disabled = false,
  onClick
}: {
  children: React.ReactNode
  rightChildren?: React.ReactNode
  shape?: 'rounded' | 'square'
  style?: React.CSSProperties
  type?: 'radio' | 'custom'
  isSelected?: boolean
  disabled?: boolean
  onClick?: () => void
}) => {
  return (
    <div
      className={cn(
        'flex flex-row justify-between items-center gap-2 p-4 bg-background-secondary w-full',
        !disabled && 'cursor-pointer hover:opacity-80',
        shape === 'rounded' ? 'rounded-lg' : 'rounded-none',
        isSelected && 'border-2 border-violet-600'
      )}
      style={{ height: '68px', ...style }}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-row items-center gap-2">{children}</div>

      <div className="flex flex-row gap-3 items-center">
        {rightChildren}
        {type === 'radio' && <RadioSelector isSelected={isSelected} />}
      </div>
    </div>
  )
}

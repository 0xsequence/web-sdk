import { ChevronRightIcon, cn } from '@0xsequence/design-system'

import { RadioSelector } from './RadioSelector.js'

export const ListCard = ({
  children,
  rightChildren,
  shape = 'rounded',
  style,
  type = 'default',
  isSelected = false,
  disabled = false,
  onClick
}: {
  children: React.ReactNode
  rightChildren?: React.ReactNode
  shape?: 'rounded' | 'square'
  style?: React.CSSProperties
  type?: 'default' | 'chevron' | 'radio'
  isSelected?: boolean
  disabled?: boolean
  onClick?: () => void
}) => {
  return (
    <div
      className={cn(
        'flex flex-row justify-between items-center bg-background-secondary w-full p-4 gap-2',
        !disabled && 'cursor-pointer hover:opacity-80',
        shape === 'rounded' ? 'rounded-lg' : 'rounded-none',
        isSelected && 'border-2 border-violet-600'
      )}
      style={{ height: '68px', ...style }}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-row gap-2 items-center w-full">{children}</div>

      {(rightChildren || type === 'chevron' || type === 'radio') && (
        <div className="flex flex-row gap-3 items-center">
          {rightChildren}
          {type === 'chevron' ? (
            <ChevronRightIcon color="white" size="md" />
          ) : type === 'radio' ? (
            <RadioSelector isSelected={isSelected} />
          ) : null}
        </div>
      )}
    </div>
  )
}

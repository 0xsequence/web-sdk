import { ChevronRightIcon, cn } from '@0xsequence/design-system'

export const ListCardNav = ({
  children,
  rightChildren,
  shape = 'rounded',
  style,
  type = 'chevron',
  onClick,
  disabled = false
}: {
  children: React.ReactNode
  rightChildren?: React.ReactNode
  shape?: 'rounded' | 'square'
  style?: React.CSSProperties
  type?: 'chevron' | 'custom'
  onClick: () => void
  disabled?: boolean
}) => {
  return (
    <div
      className={cn(
        `flex flex-row justify-between items-center bg-background-secondary w-full p-4 ${!disabled && 'cursor-pointer hover:opacity-80'}`,
        shape === 'rounded' ? 'rounded-lg' : 'rounded-none'
      )}
      style={{ height: '52px', ...(disabled ? { opacity: 0.6 } : {}), ...style }}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex flex-row gap-2 items-center w-full">{children}</div>

      {(rightChildren || type === 'chevron') && (
        <div className="flex flex-row gap-1 items-center">
          {rightChildren}
          {type === 'chevron' && <ChevronRightIcon color="white" size="md" />}
        </div>
      )}
    </div>
  )
}

import { cn, ChevronRightIcon } from '@0xsequence/design-system'

export const ListCardNav = ({
  children,
  rightChildren,
  shape = 'rounded',
  style,
  type = 'chevron',
  onClick
}: {
  children: React.ReactNode
  rightChildren?: React.ReactNode
  shape?: 'rounded' | 'square'
  style?: React.CSSProperties
  type?: 'chevron' | 'custom'
  onClick: () => void
}) => {
  return (
    <div
      className={cn(
        'flex flex-row justify-between items-center bg-background-secondary cursor-pointer hover:opacity-80 w-full p-4',
        shape === 'rounded' ? 'rounded-lg' : 'rounded-none'
      )}
      style={{ height: '52px', ...style }}
      onClick={onClick}
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

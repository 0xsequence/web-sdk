import { cn, ChevronRightIcon } from '@0xsequence/design-system'

export const ListCardNav = ({
  children,
  rightChildren,
  shape = 'rounded',
  style,
  onClick
}: {
  children: React.ReactNode
  rightChildren?: React.ReactNode
  shape?: 'rounded' | 'square'
  style?: React.CSSProperties
  onClick: () => void
}) => {
  return (
    <div
      className={cn(
        'flex flex-row justify-between items-center p-4 bg-background-secondary cursor-pointer hover:opacity-80 w-full',
        shape === 'rounded' ? 'rounded-lg' : 'rounded-none'
      )}
      style={{ height: '52px', ...style }}
      onClick={onClick}
    >
      {children}

      <div className="flex flex-row gap-1 items-center">
        {rightChildren}
        <ChevronRightIcon color="white" />
      </div>
    </div>
  )
}

import { cardVariants, cn, ChevronRightIcon } from '@0xsequence/design-system'

export const ListCardNav = ({
  children,
  rightChildren,
  rounded,
  style,
  onClick
}: {
  children: React.ReactNode
  rightChildren?: React.ReactNode
  rounded?: boolean
  style?: React.CSSProperties
  onClick: () => void
}) => {
  return (
    <div
      className={cn(
        cardVariants({ clickable: true }),
        'flex flex-row justify-between items-center p-4 bg-background-secondary cursor-pointer hover:opacity-80',
        rounded ? 'rounded-lg' : 'rounded-none'
      )}
      style={{ height: '52px', ...style }}
      onClick={onClick}
    >
      {children}

      <div className="flex flex-row gap-1 items-center">
        {rightChildren}
        <ChevronRightIcon color="white" size="lg" />
      </div>
    </div>
  )
}

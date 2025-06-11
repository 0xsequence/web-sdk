import { cn } from '@0xsequence/design-system'

export const MiniButton = ({
  children,
  className,
  style,
  ref,
  onClick
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  ref?: React.RefObject<HTMLDivElement>
  onClick?: () => void
}) => {
  return (
    <div
      ref={ref}
      className={cn(
        `flex flex-row justify-between items-center bg-background-secondary hover:opacity-80 cursor-pointer w-fit rounded-full py-2 px-4 gap-2`,
        className
      )}
      style={{ ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

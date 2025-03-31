import { MediaIconWrapper } from './MediaIconWrapper'

export const StackedIconTag = ({
  iconList,
  isAccount = false,
  shape = 'rounded',
  label = undefined,
  onClick
}: {
  iconList: string[]
  isAccount?: boolean
  shape?: 'rounded' | 'square'
  label?: React.ReactNode
  onClick?: () => void
}) => {
  const shapeClass = shape === 'rounded' ? 'rounded-full' : 'rounded-lg'
  return (
    <div
      className={`${shapeClass} flex flex-row items-center bg-background-secondary hover:opacity-80 cursor-pointer focus:ring-2 focus:ring-focus focus:outline-hidden px-2 py-1`}
      style={{ height: '28px', gap: '3px' }}
      onClick={onClick}
    >
      {iconList.length > 0 && <MediaIconWrapper iconList={iconList} isAccount={isAccount} shape={shape} size="4xs" />}
      {label}
    </div>
  )
}

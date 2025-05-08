import { MediaIconWrapper } from './MediaIconWrapper.js'

export const StackedIconTag = ({
  iconList,
  isAccount = false,
  shape = 'rounded',
  label = undefined,
  onClick,
  enabled = false
}: {
  iconList: string[] | React.ReactNode[]
  isAccount?: boolean
  shape?: 'rounded' | 'square'
  label?: React.ReactNode
  onClick?: () => void
  enabled?: boolean
}) => {
  const shapeClass = shape === 'rounded' ? 'rounded-full' : 'rounded-lg'
  return (
    <div
      className={`${shapeClass} flex flex-row items-center bg-background-secondary px-2 py-1 ${enabled ? 'hover:opacity-80 cursor-pointer focus:ring-2 focus:ring-focus focus:outline-hidden' : ''}`}
      style={{ height: '28px', gap: '6px' }}
      onClick={onClick}
    >
      {iconList.length > 0 && <MediaIconWrapper iconList={iconList} isAccount={isAccount} shape={shape} size="4xs" />}
      {label}
    </div>
  )
}

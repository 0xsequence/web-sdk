import { GradientAvatar } from '@0xsequence/design-system'

const widthClassMap = {
  '4xs': 'w-4 h-4',
  '2xs': 'w-6 h-6',
  base: 'w-11 h-11',
  lg: 'w-14 h-14',
  '2lg': 'w-16 h-16',
  '3lg': 'w-20 h-20'
}

export const MediaIconWrapper = ({
  iconList,
  isAccount = false,
  size = 'base',
  shape = 'rounded'
}: {
  iconList: string[]
  isAccount?: boolean
  size?: '4xs' | '2xs' | 'base' | 'lg' | '2lg' | '3lg'
  shape?: 'rounded' | 'square'
}) => {
  const firstThreeIcons = iconList.slice(0, 3)

  let partialWidth = 0
  let shapeClass = 'rounded-lg;'

  switch (size) {
    case '4xs':
      partialWidth = 8
      shapeClass = 'rounded-xs'
      break
    case '2xs':
      partialWidth = 12
      shapeClass = 'rounded-md'
      break
    case 'base':
      partialWidth = 22
      break
    case 'lg':
      partialWidth = 28
      break
    case '2lg':
      partialWidth = 32
      break
    case '3lg':
      partialWidth = 40
      break
  }

  const width = firstThreeIcons.length * partialWidth + partialWidth

  if (shape === 'rounded') {
    shapeClass = 'rounded-full'
  }

  return (
    <div className="flex flex-row relative" style={{ position: 'relative', width: `${width}px` }}>
      {firstThreeIcons.map((icon, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: '50%',
            left: `${index * partialWidth}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {isAccount ? (
            <div className={`${shapeClass} border overflow-hidden ${widthClassMap[size]}`}>
              <GradientAvatar address={icon} className="w-full h-full" />
            </div>
          ) : (
            <div
              className={`${shapeClass} border overflow-hidden ${widthClassMap[size]}`}
              style={{ backgroundColor: 'lightgrey' }}
            >
              <img src={icon} alt="icon" className="w-full h-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

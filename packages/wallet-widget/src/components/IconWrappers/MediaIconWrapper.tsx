import { GradientAvatar } from '@0xsequence/design-system'

const widthClassMap = {
  '4xs': '16px',
  '2xs': '24px',
  sm: '32px',
  base: '44px',
  lg: '56px',
  '2lg': '64px',
  '3lg': '80px'
}

export const MediaIconWrapper = ({
  iconList,
  isAccount = false,
  size = 'base',
  shape = 'rounded'
}: {
  iconList: string[] | React.ReactNode[]
  isAccount?: boolean
  size?: '4xs' | '2xs' | 'sm' | 'base' | 'lg' | '2lg' | '3lg'
  shape?: 'rounded' | 'square'
}) => {
  const firstThreeIcons = iconList.slice(0, 3)

  let partialWidth = 0
  let shapeClass = 'rounded-lg'

  switch (size) {
    case '4xs':
      partialWidth = 8
      shapeClass = 'rounded-sm'
      break
    case '2xs':
      partialWidth = 12
      shapeClass = 'rounded-md'
      break
    case 'sm':
      partialWidth = 16
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
          {typeof icon === 'string' ? (
            <>
              {isAccount ? (
                <div
                  className={`flex items-center justify-center ${shapeClass} border bg-background-primary`}
                  style={{ width: `calc(${widthClassMap[size]} + 2px)`, height: `calc(${widthClassMap[size]} + 2px)` }}
                >
                  <GradientAvatar address={icon} className="w-full h-full" />
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center ${shapeClass} border overflow-hidden`}
                  style={{
                    width: `calc(${widthClassMap[size]} + 2px)`,
                    height: `calc(${widthClassMap[size]} + 2px)`
                  }}
                >
                  <img src={icon} alt="icon" style={{ backgroundColor: 'lightgray' }} />
                </div>
              )}
            </>
          ) : (
            <div
              className={`flex items-center justify-center ${shapeClass} border bg-background-primary`}
              style={{
                width: `calc(${widthClassMap[size]} + 2px)`,
                height: `calc(${widthClassMap[size]} + 2px)`
              }}
            >
              {icon}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

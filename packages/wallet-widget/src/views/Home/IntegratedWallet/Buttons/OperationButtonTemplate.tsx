import { cardVariants, cn, Text, IconProps } from '@0xsequence/design-system'
import { ComponentType } from 'react'

export const OperationButtonTemplate = ({
  label,
  onClick,
  icon: Icon
}: {
  label: string
  onClick: () => void
  icon: ComponentType<IconProps>
}) => {
  return (
    <div
      className={cn(cardVariants({ clickable: true }), 'flex flex-col justify-center items-center w-full gap-1')}
      onClick={onClick}
      style={{ height: '68px' }}
    >
      {Icon && <Icon size="md" color="white" />}
      <Text
        variant="small"
        fontWeight="bold"
        color="primary"
        style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
      >
        {label}
      </Text>
    </div>
  )
}

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
    <div className={cn(cardVariants({ clickable: true }), 'flex flex-col items-center w-full gap-1')} onClick={onClick}>
      {Icon && <Icon size="lg" color="white" />}
      <Text
        variant="normal"
        fontWeight="semibold"
        color="primary"
        style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
      >
        {label}
      </Text>
    </div>
  )
}

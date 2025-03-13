import { cn, cardVariants } from '@0xsequence/design-system'
import { SelectedIndicator } from './SelectedIndicator'

export const SelectRow = ({
  isSelected,
  children,
  onClick
}: {
  isSelected: boolean
  children: React.ReactNode
  onClick: () => void
}) => {
  return (
    <div
      className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
      style={{ height: '60px' }}
      onClick={onClick}
    >
      <div className="flex flex-row items-center gap-2">{children}</div>
      <SelectedIndicator selected={isSelected} />
    </div>
  )
}

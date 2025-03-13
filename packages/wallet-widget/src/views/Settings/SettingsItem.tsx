import { cardVariants, cn, ChevronRightIcon, Text } from '@0xsequence/design-system'

export const SettingsItem = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <div
      className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center h-16 p-3')}
      onClick={onClick}
    >
      <Text color="primary" fontWeight="medium" variant="normal">
        {label}
      </Text>
      <ChevronRightIcon color="white" />
    </div>
  )
}

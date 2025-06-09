import { Text } from '@0xsequence/design-system'

export const PropertiesBadge = ({ name, value }: { name: string; value: string }) => {
  return (
    <div className="flex flex-col bg-background-secondary py-2 px-3 gap-1 rounded-xl justify-center items-start w-full">
      <Text variant="small" color="muted">
        Property
      </Text>
      <div className="flex flex-row justify-between items-center gap-1 w-full">
        <Text fontWeight="bold" color="primary">
          {name}
        </Text>
        <Text variant="small" fontWeight="bold" color="muted">
          {value}
        </Text>
      </div>
    </div>
  )
}

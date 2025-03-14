import { truncateAtMiddle } from '@0xsequence/connect'
import { Button, Card, cn, Text } from '@0xsequence/design-system'

interface WalletListItemProps {
  id: string
  name: string
  address: string
  isActive: boolean
  isEmbedded?: boolean
  onSelect: () => void
  onDisconnect: () => void
}

export const WalletListItem = ({ id, name, address, isActive, isEmbedded, onSelect, onDisconnect }: WalletListItemProps) => {
  return (
    <Card
      className={cn(
        'flex flex-row items-center justify-between relative',
        isActive ? 'bg-background-secondary' : 'bg-background-muted'
      )}
      key={id}
    >
      <div className="absolute top-0 left-0 right-0 bottom-0" onClick={onSelect} style={{ cursor: 'pointer', zIndex: 1 }} />
      <div className="flex flex-row items-center">
        <div className="border" />
        <div className="flex flex-col gap-1">
          <Text variant="normal" color="primary">
            {isEmbedded ? 'Embedded - ' : ''}
            {name}
          </Text>
          <Text variant="normal" fontWeight="bold" color="primary">
            {truncateAtMiddle(address, 10)}
          </Text>
        </div>
      </div>
      <Button variant="text" size="sm" label="Disconnect" onClick={onDisconnect} style={{ position: 'relative', zIndex: 2 }} />
    </Card>
  )
}

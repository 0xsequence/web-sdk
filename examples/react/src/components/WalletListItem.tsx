import { Box, Button, Text } from '@0xsequence/design-system'
import { truncateAtMiddle } from '@0xsequence/kit'

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
    <Box
      key={id}
      padding="2"
      borderRadius="md"
      background={isActive ? 'backgroundRaised' : 'backgroundMuted'}
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <Box display="flex" flexDirection="row" alignItems="center" gap="2">
        <Box borderColor="text50" background={isActive ? 'text100' : 'transparent'} />
        <Box flexDirection="column" gap="1">
          <Text variant="normal" color="text100">
            {isEmbedded ? 'Embedded - ' : ''}
            {name}
          </Text>
          <Text variant="normal" fontWeight="bold" color="text100">
            {truncateAtMiddle(address, 10)}
          </Text>
        </Box>
      </Box>
      <Button variant="text" size="sm" label="Disconnect" onClick={onDisconnect} />
    </Box>
  )
}

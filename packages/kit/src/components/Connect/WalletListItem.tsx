import { Box, CloseIcon, IconButton, LinkIcon, Text, Tooltip, truncateAddress } from '@0xsequence/design-system'
import React from 'react'

export interface WalletListItemProps {
  name: string
  address: string
  isEmbedded: boolean
  isActive: boolean
  isLinked: boolean
  isReadOnly: boolean
  onDisconnect: () => void
}

export const WalletListItem: React.FC<WalletListItemProps> = ({
  name,
  address,
  isEmbedded,
  isActive,
  isLinked,
  isReadOnly,
  onDisconnect
}) => {
  return (
    <Box
      padding="2"
      borderRadius="md"
      background="backgroundSecondary"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" flexDirection="row" alignItems="center" gap="2">
        <Box borderColor="text50" background={isActive ? 'text100' : 'transparent'} />
        <Box flexDirection="column" gap="1">
          <Box display="flex" flexDirection="row" alignItems="center" gap="1">
            <Text variant="normal" color="text100">
              {isEmbedded ? 'Embedded - ' : ''}
              {name}
            </Text>
            {isLinked && (
              <Tooltip message="Linked">
                <Box position="relative">
                  <LinkIcon size="xs" color="text50" />
                </Box>
              </Tooltip>
            )}
            {isReadOnly && (
              <Text variant="small" color="text50">
                (read-only)
              </Text>
            )}
          </Box>
          <Text variant="normal" fontWeight="bold" color="text100">
            {truncateAddress(address, 8, 5)}
          </Text>
        </Box>
      </Box>
      {!isReadOnly && <IconButton size="xs" icon={CloseIcon} onClick={onDisconnect} />}
    </Box>
  )
}

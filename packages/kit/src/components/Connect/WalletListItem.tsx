import {
  Box,
  Button,
  CheckmarkIcon,
  CloseIcon,
  IconButton,
  LinkIcon,
  Spinner,
  Text,
  Tooltip,
  truncateAddress
} from '@0xsequence/design-system'
import React, { useState } from 'react'

export interface WalletListItemProps {
  name: string
  address: string
  isEmbedded: boolean
  isActive: boolean
  isLinked: boolean
  isReadOnly: boolean
  onDisconnect: () => void
  onUnlink?: () => void
}

export const WalletListItem: React.FC<WalletListItemProps> = ({
  name,
  address,
  isEmbedded,
  isActive,
  isLinked,
  isReadOnly,
  onDisconnect,
  onUnlink
}) => {
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)

  const handleUnlink = () => {
    setIsUnlinking(true)
    onUnlink?.()
  }

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
              <Tooltip message="Linked to embedded wallet">
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
      {!isReadOnly && <Button size="xs" variant="glass" label="Disconnect" onClick={onDisconnect} />}
      {isReadOnly && isLinked && (
        <Box position="relative" display="flex" alignItems="center" gap="2">
          {isUnlinking ? (
            <Spinner />
          ) : showUnlinkConfirm ? (
            <Box display="flex" gap="3">
              <IconButton size="xs" variant="danger" icon={CheckmarkIcon} onClick={handleUnlink} />
              <IconButton size="xs" variant="glass" icon={CloseIcon} onClick={() => setShowUnlinkConfirm(false)} />
            </Box>
          ) : (
            <Button size="xs" variant="glass" label="Unlink" onClick={() => setShowUnlinkConfirm(true)} />
          )}
        </Box>
      )}
    </Box>
  )
}

import { truncateAtIndex } from '@0xsequence/connect'
import {
  Button,
  Card,
  CheckmarkIcon,
  CloseIcon,
  cn,
  IconButton,
  LinkIcon,
  Spinner,
  Text,
  Tooltip
} from '@0xsequence/design-system'
import React, { useState } from 'react'

export interface WalletListItemProps {
  name: string
  address: string
  embeddedWalletTitle?: string
  isEmbedded: boolean
  isActive: boolean
  isLinked: boolean
  isReadOnly: boolean
  onDisconnect: () => void
  onReconnect?: () => void
  onUnlink?: () => void
}

export const WalletListItem: React.FC<WalletListItemProps> = ({
  name,
  address,
  embeddedWalletTitle,
  isEmbedded,
  isActive,
  isLinked,
  isReadOnly,
  onDisconnect,
  onReconnect,
  onUnlink
}) => {
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)

  const handleUnlink = () => {
    setIsUnlinking(true)
    onUnlink?.()
  }

  return (
    <Card
      className={cn('flex flex-row items-center justify-between', isActive ? 'bg-background-secondary' : 'bg-background-muted')}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-1">
            <Text variant="normal" color="primary">
              {isEmbedded ? (embeddedWalletTitle ? embeddedWalletTitle : 'Embedded - ') : ''}
              {isEmbedded && embeddedWalletTitle ? '' : name}
            </Text>
            {isLinked && (
              <Tooltip message="Linked to embedded wallet">
                <div className="relative">
                  <LinkIcon className="text-muted" size="xs" />
                </div>
              </Tooltip>
            )}
            {isReadOnly && (
              <Text variant="small" color="muted">
                (read-only)
              </Text>
            )}
          </div>
          <Text variant="normal" fontWeight="bold" color="primary">
            {truncateAtIndex(address, 8)}
          </Text>
        </div>
      </div>

      {!isReadOnly && (
        <Button size="xs" variant="secondary" onClick={onDisconnect}>
          Disconnect
        </Button>
      )}

      {isReadOnly && isLinked && (
        <div className="flex relative items-center gap-2">
          {isUnlinking ? (
            <Spinner />
          ) : showUnlinkConfirm ? (
            <div className="flex gap-3">
              <IconButton size="xs" variant="destructive" icon={CheckmarkIcon} onClick={handleUnlink} />
              <IconButton size="xs" variant="ghost" icon={CloseIcon} onClick={() => setShowUnlinkConfirm(false)} />
            </div>
          ) : (
            <>
              {onReconnect && (
                <Button size="xs" variant="ghost" onClick={onReconnect}>
                  Reconnect
                </Button>
              )}
              <Button size="xs" variant="ghost" onClick={() => setShowUnlinkConfirm(true)}>
                Unlink
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

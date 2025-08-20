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
  onReconnect?: () => void
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
  onUnlink,
  onReconnect
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
              {isEmbedded ? 'Embedded - ' : ''}
              {name}
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
            {truncateAddress(address, 8, 5)}
          </Text>
        </div>
      </div>

      {!isReadOnly && <Button size="xs" variant="glass" label="Disconnect" onClick={onDisconnect} />}

      {isReadOnly && isLinked && (
        <div className="flex relative items-center gap-2">
          {isUnlinking ? (
            <Spinner />
          ) : showUnlinkConfirm ? (
            <div className="flex gap-3">
              <IconButton size="xs" variant="danger" icon={CheckmarkIcon} onClick={handleUnlink} />
              <IconButton size="xs" variant="glass" icon={CloseIcon} onClick={() => setShowUnlinkConfirm(false)} />
            </div>
          ) : (
            <>
              {onReconnect && <Button size="xs" variant="glass" label="Reconnect" onClick={onReconnect} />}
              <Button size="xs" variant="glass" label="Unlink" onClick={() => setShowUnlinkConfirm(true)} />
            </>
          )}
        </div>
      )}
    </Card>
  )
}

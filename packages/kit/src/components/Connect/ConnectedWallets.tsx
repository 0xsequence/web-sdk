import { LinkedWallet } from '@0xsequence/api'
import { motion, AnimatePresence } from 'motion/react'
import React, { useMemo, useEffect, useRef } from 'react'

import { KitWallet } from '../../hooks/useKitWallets'

import { WalletListItem, WalletListItemProps } from './WalletListItem'

interface ConnectedWalletsProps {
  wallets: KitWallet[]
  linkedWallets?: LinkedWallet[]
  disconnectWallet: (address: string) => void
  unlinkWallet: (address: string) => void
}

const MAX_HEIGHT = 240

export const ConnectedWallets = ({
  wallets,
  linkedWallets,
  disconnectWallet,
  unlinkWallet
}: ConnectedWalletsProps): JSX.Element | null => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const updateScrollFades = (target: HTMLElement) => {
    const isScrollable = target.scrollHeight > MAX_HEIGHT
    const isAtBottom = target.scrollHeight - target.scrollTop <= MAX_HEIGHT
    const isAtTop = target.scrollTop === 0

    const bottomFadeElement = target.parentElement?.querySelector('.scroll-fade') as HTMLElement
    const topFadeElement = target.parentElement?.querySelector('.scroll-fade-top') as HTMLElement

    if (bottomFadeElement) {
      bottomFadeElement.style.opacity = isScrollable && !isAtBottom ? '1' : '0'
    }
    if (topFadeElement) {
      topFadeElement.style.opacity = isScrollable && !isAtTop ? '1' : '0'
    }
  }

  const allWallets = useMemo<WalletListItemProps[]>(() => {
    // Get read-only linked wallets that aren't connected
    const readOnlyLinkedWallets = (linkedWallets ?? [])
      .filter(lw => !wallets.some(w => w.address.toLowerCase() === lw.linkedWalletAddress.toLowerCase()))
      .map(lw => ({
        name: lw.walletType || 'Linked Wallet',
        address: lw.linkedWalletAddress,
        isEmbedded: false,
        isActive: false,
        isLinked: true,
        isReadOnly: true,
        onDisconnect: () => {}, // No-op for read-only wallets
        onUnlink: () => {
          unlinkWallet(lw.linkedWalletAddress)
        }
      }))

    // Transform KitWallet to WalletListItemProps
    const connectedWallets = wallets.map(wallet => ({
      name: wallet.name,
      address: wallet.address,
      isEmbedded: wallet.isEmbedded,
      isActive: wallet.isActive,
      isLinked: linkedWallets?.some(lw => lw.linkedWalletAddress.toLowerCase() === wallet.address.toLowerCase()) ?? false,
      isReadOnly: false,
      onDisconnect: () => disconnectWallet(wallet.address),
      onUnlink: () => {} // No-op for connected wallets
    }))

    // Sort wallets: embedded first, then by name and address
    const sortedConnectedWallets = [...connectedWallets].sort((a, b) => {
      if (a.isEmbedded && !b.isEmbedded) return -1
      if (!a.isEmbedded && b.isEmbedded) return 1
      return (
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || a.address.toLowerCase().localeCompare(b.address.toLowerCase())
      )
    })

    // Sort read-only linked wallets by name and address
    const sortedReadOnlyWallets = [...readOnlyLinkedWallets].sort(
      (a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || a.address.toLowerCase().localeCompare(b.address.toLowerCase())
    )

    // Combine all wallets
    return [...sortedConnectedWallets, ...sortedReadOnlyWallets]
  }, [wallets, linkedWallets, disconnectWallet])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      // Initial check
      updateScrollFades(container)

      // Check again after animations complete (approximately)
      const timeout = setTimeout(() => {
        updateScrollFades(container)
      }, 500) // Half second delay to allow animations to settle

      return () => clearTimeout(timeout)
    }
  }, [allWallets]) // Re-run when wallets change as it affects content height

  if (wallets.length === 0) return null

  return (
    <div className="flex mt-4 flex-col">
      <div className="relative">
        <motion.div
          className="flex py-1 gap-2 flex-col overflow-y-auto"
          ref={scrollContainerRef}
          onScroll={(e: React.UIEvent<HTMLDivElement>) => {
            updateScrollFades(e.currentTarget)
          }}
          style={{
            maxHeight: `${MAX_HEIGHT}px`,
            scrollbarWidth: 'none',
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {allWallets.map((wallet, index) => (
              <motion.div
                key={wallet.address}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: (i: number) => ({
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      delay: i * 0.1
                    }
                  })
                }}
                style={{ willChange: 'transform, opacity', transformOrigin: 'center' }}
              >
                <WalletListItem {...wallet} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <div
          className="scroll-fade-top absolute top-0 left-0 right-0"
          style={{
            height: '30px',
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0), var(--seq-color-background-primary))',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        />
        <div
          className="scroll-fade absolute bottom-0 left-0 right-0"
          style={{
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), var(--seq-color-background-primary))',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
        />
      </div>
    </div>
  )
}

import {
  ArrowRightIcon,
  Card,
  IconButton,
  ModalPrimitive,
  Scroll,
  SearchIcon,
  SearchInput,
  Text,
  useTheme
} from '@0xsequence/design-system'
import Fuse from 'fuse.js'
import { useState } from 'react'

import type { ExtendedConnector } from '../../types.js'
import { getLogo } from '../ConnectButton/index.js'

interface ExtendedWalletListProps {
  onConnect: (connector: ExtendedConnector) => void
  title: string
  connectors: ExtendedConnector[]
  onGoBack: () => void
  searchable: boolean
}

export const ExtendedWalletList = ({ onConnect, connectors, title, onGoBack, searchable }: ExtendedWalletListProps) => {
  const { theme } = useTheme()
  const [search, setSearch] = useState('')

  const fuzzyConnectors = new Fuse(connectors, {
    keys: ['_wallet.name']
  })

  const foundConnectors = fuzzyConnectors.search(search)

  const displayedConnectors = search === '' ? connectors : foundConnectors.map(connector => connector.item)

  const maxConnectorsInView = searchable ? 6 : 8
  const gutterHeight = 8
  const optionHeight = 48
  const displayedOptionsAmount = Math.min(displayedConnectors.length, maxConnectorsInView)
  const displayedGuttersAmount = displayedOptionsAmount - 1

  const searchableAreaHeight = `${optionHeight * maxConnectorsInView + gutterHeight * (maxConnectorsInView - 1)}px`
  const viewheight = `${optionHeight * displayedOptionsAmount + gutterHeight * displayedGuttersAmount}px`

  const ConditionalScrollbar = ({ children }: { children: React.ReactNode }) => {
    if (displayedConnectors.length > maxConnectorsInView || searchable) {
      return (
        <Scroll
          shadows={false}
          style={{
            height: searchable ? searchableAreaHeight : viewheight,
            scrollbarColor: 'gray black',
            scrollbarWidth: 'thin'
          }}
        >
          {children}
        </Scroll>
      )
    }

    return children
  }

  return (
    <div className="p-4">
      <div className="absolute top-4 left-4">
        <IconButton
          className="bg-button-glass"
          onClick={onGoBack}
          size="xs"
          icon={() => <ArrowRightIcon style={{ transform: 'rotate(180deg)' }} />}
        />
      </div>
      <div className="flex justify-center text-primary items-center font-medium mt-2 mb-4">
        <ModalPrimitive.Title asChild>
          <Text>{title}</Text>
        </ModalPrimitive.Title>
      </div>
      {searchable && (
        <div className="w-full mb-4">
          <SearchInput
            autoFocus
            name="search"
            leftIcon={SearchIcon}
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            placeholder="Search"
            data-1p-ignore
          />
        </div>
      )}
      <ConditionalScrollbar>
        <div className="flex flex-col gap-2">
          {displayedConnectors.map(connector => {
            const walletName = connector._wallet.name
            const connectorId = connector._wallet.id

            const walletProps = connector._wallet

            const Logo = getLogo(theme, walletProps)

            return (
              <Card
                className="flex gap-2 items-center justify-start w-full h-12 px-4"
                clickable
                key={connectorId}
                onClick={() => onConnect(connector)}
              >
                <Logo className="w-5 h-5" />
                <Text variant="normal" fontWeight="bold" color="primary">
                  {walletName}
                </Text>
              </Card>
            )
          })}
        </div>
      </ConditionalScrollbar>
    </div>
  )
}

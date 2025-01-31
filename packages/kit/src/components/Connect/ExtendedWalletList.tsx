import Fuse from 'fuse.js'
import { useState } from 'react'
import {
  ArrowRightIcon,
  Box,
  Card,
  IconButton,
  ModalPrimitive,
  Scroll,
  SearchIcon,
  SearchInput,
  Text,
  useTheme
} from '@0xsequence/design-system'

import { getLogo } from '../ConnectButton'
import { ExtendedConnector } from '../../types'

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
    <Box padding="4">
      <Box position="absolute" top="4" left="4">
        <IconButton
          onClick={onGoBack}
          background="buttonGlass"
          size="xs"
          icon={() => <ArrowRightIcon style={{ transform: 'rotate(180deg)' }} />}
        />
      </Box>
      <Box justifyContent="center" color="text100" alignItems="center" fontWeight="medium" marginTop="2" marginBottom="4">
        <ModalPrimitive.Title asChild>
          <Text>{title}</Text>
        </ModalPrimitive.Title>
      </Box>

      {searchable && (
        <Box width="full" marginBottom="4">
          <SearchInput
            autoFocus
            name="search"
            leftIcon={SearchIcon}
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            placeholder="Search"
            data-1p-ignore
          />
        </Box>
      )}
      <ConditionalScrollbar>
        <Box flexDirection="column" gap="2">
          {displayedConnectors.map(connector => {
            const walletName = connector._wallet.name
            const connectorId = connector._wallet.id

            const walletProps = connector._wallet

            const Logo = getLogo(theme, walletProps)

            return (
              <Card
                gap="2"
                alignItems="center"
                justifyContent="flex-start"
                width="full"
                height="12"
                paddingX="4"
                clickable
                key={connectorId}
                onClick={() => onConnect(connector)}
              >
                <Box as={Logo} width="5" height="5" />
                <Text variant="normal" fontWeight="bold" color="text100">
                  {walletName}
                </Text>
              </Card>
            )
          })}
        </Box>
      </ConditionalScrollbar>
    </Box>
  )
}

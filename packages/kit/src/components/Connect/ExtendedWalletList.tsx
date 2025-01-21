import { ArrowRightIcon, Box, Card, IconButton, ModalPrimitive, Text, useTheme } from '@0xsequence/design-system'

import { getLogo } from '../ConnectButton'
import { ExtendedConnector } from '../../types'

interface ExtendedWalletListProps {
  onConnect: (connector: ExtendedConnector) => void
  title: string
  connectors: ExtendedConnector[]
  onGoBack: () => void
}

export const ExtendedWalletList = ({ onConnect, connectors, title, onGoBack }: ExtendedWalletListProps) => {
  const { theme } = useTheme()

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
      <Box
        justifyContent="center"
        color="text100"
        alignItems="center"
        fontWeight="medium"
        style={{
          marginTop: '4px'
        }}
      >
        <ModalPrimitive.Title asChild>
          <Text>{title}</Text>
        </ModalPrimitive.Title>
      </Box>

      <Box flexDirection="column" gap="2" marginTop="5">
        {connectors.map(connector => {
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
    </Box>
  )
}

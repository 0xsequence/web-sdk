import { Box, Button, Text, useTheme } from '@0xsequence/design-system'
import { useConnect } from 'wagmi'

import { ExtendedConnector } from '../../types'

interface ExtendedWalletListProps {
  onConnect: (connector: ExtendedConnector) => void
  connectors: ExtendedConnector[]
}

export const ExtendedWalletList = ({ onConnect, connectors }: ExtendedWalletListProps) => {
  const { theme } = useTheme()
  const { isPending } = useConnect()

  return (
    <Box flexDirection="column" gap="2" marginTop="5">
      {connectors.map(connector => {
        const Logo = theme === 'dark' ? connector._wallet.logoDark : connector._wallet.logoLight
        const walletName = connector._wallet.name
        const connectorId = connector._wallet.id

        return (
          <Button
            key={connectorId}
            width="full"
            shape="square"
            leftIcon={() => (
              <Box
                justifyContent="center"
                alignItems="center"
                style={{ backgroundColor: connector._wallet.iconBackground }}
                width="8"
                height="8"
                overflow="hidden"
              >
                <Logo style={{ width: 30 }} />
              </Box>
            )}
            onClick={() => onConnect(connector)}
            label={
              <Text>
                {walletName}
                {isPending}
              </Text>
            }
          />
        )
      })}
    </Box>
  )
}

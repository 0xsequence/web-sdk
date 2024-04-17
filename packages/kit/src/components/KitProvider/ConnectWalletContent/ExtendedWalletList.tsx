import React, { useState } from 'react'

import { Box, Button, Text, TokenImage, useTheme } from '@0xsequence/design-system'
import { useConnect } from 'wagmi'

import { ExtendedConnector } from '../../../utils/getKitConnectWallets'

import * as styles from '../../styles.css'

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
        const Logo =
          theme === 'dark'
            ? (connector._wallet.logoDark as React.FunctionComponent)
            : (connector._wallet.logoLight as React.FunctionComponent)
        const walletName = connector._wallet.name
        const connectorId = connector._wallet.id

        return (
          <Button
            key={connectorId}
            width="full"
            shape="square"
            onClick={() => onConnect(connector)}
            label={
              <Box gap="2" alignItems="center">
                <Box
                  justifyContent="center"
                  alignItems="center"
                  style={{ backgroundColor: connector._wallet.iconBackground }}
                  className={styles.walletLogoContainerExtended}
                  overflow="hidden"
                  borderRadius="circle"
                >
                  <Logo />
                </Box>
                <Text>
                  {walletName}
                  {isPending}
                </Text>
              </Box>
            }
          />
        )
      })}
    </Box>
  )
}

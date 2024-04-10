import React, { useState } from 'react'

import { Box, Text, useTheme } from '@0xsequence/design-system'
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
          <Box
            key={connectorId}
            as="button"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            background="backgroundSecondary"
            color="text100"
            borderRadius="md"
            padding="4"
            style={{
              height: '60px'
            }}
            className={styles.networkButton}
            onClick={() => onConnect(connector)}
          >
            <Text variant="medium" color="text100">
              {walletName}
              {isPending}
            </Text>
            <Box
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: connector._wallet.iconBackground }}
              borderRadius="md"
              className={styles.walletLogoContainerExtended}
            >
              <Logo />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

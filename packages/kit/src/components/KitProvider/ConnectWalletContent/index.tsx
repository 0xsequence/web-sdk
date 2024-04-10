import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  ChevronLeftIcon,
  ChevronRightIcon,
  Divider,
  Text,
  TextInput,
  vars,
  useTheme
} from '@0xsequence/design-system'
import { useConnect, useAccount } from 'wagmi'
import { EMAIL_CONNECTOR_LOCAL_STORAGE_KEY } from '@0xsequence/kit-connectors'

import { ExtendedWalletList } from './ExtendedWalletList'
import { Banner } from './Banner'

import { KitConfig } from '../../index'
import { defaultSignInOptions } from '../../../constants'
import { isEmailValid } from '../../../utils'
import { KitConnectProviderProps } from '../index'
import { ExtendedConnector } from '../../../utils/getKitConnectWallets'

import * as styles from '../../styles.css'

interface ConnectWalletContentProps extends KitConnectProviderProps {
  openConnectModal: boolean
  setOpenConnectModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const ConnectWalletContent = (props: ConnectWalletContentProps) => {
  const { isConnected } = useAccount()
  const { theme } = useTheme()
  const { config = {} } = props
  const { signIn = {} } = config as KitConfig
  const {
    showEmailInput = defaultSignInOptions.showEmailInput,
    socialAuthOptions = defaultSignInOptions.socialAuthOptions,
    walletAuthOptions = defaultSignInOptions.walletAuthOptions
  } = signIn

  const { openConnectModal, setOpenConnectModal } = props

  const [email, setEmail] = useState('')
  const { connectors: baseConnectors, connect } = useConnect()
  /* @ts-ignore-next-line */
  const connectors = baseConnectors.filter(c => !!c?._wallet) as ExtendedConnector[]
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const mockConnector = connectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  const emailConnector = connectors.find(c => c._wallet.id === 'email')
  const walletConnectors = connectors
    .filter(connector => {
      const foundOption = walletAuthOptions.find(authOption => authOption === connector._wallet.id)
      return !!foundOption
    })
    .sort((a, b) => {
      return walletAuthOptions.indexOf(a._wallet.id) - walletAuthOptions.indexOf(b._wallet.id)
    })

  const socialAuthConnectors = connectors
    .filter(connector => {
      const foundOption = socialAuthOptions.find(authOption => authOption === connector._wallet.id)
      return !!foundOption
    })
    .sort((a, b) => {
      return socialAuthOptions.indexOf(a._wallet.id) - socialAuthOptions.indexOf(b._wallet.id)
    })

  const displayExtendedListButton = walletConnectors.length > 4

  const onChangeEmail = (ev: React.ChangeEventHandler<HTMLInputElement>) => {
    /* @ts-ignore-next-line */
    setEmail(ev.target.value)
  }

  useEffect(() => {
    if (isConnected && openConnectModal) {
      setOpenConnectModal(false)
    }
  }, [isConnected, openConnectModal])

  const onConnect = (connector: ExtendedConnector) => {
    if (signIn.useMock && mockConnector) {
      connect({ connector: mockConnector })
      return
    }

    if (connector._wallet.id === 'email') {
      const email = prompt('Auto-email login, please specify the email address:')
      localStorage.setItem(EMAIL_CONNECTOR_LOCAL_STORAGE_KEY, email || '')
    }

    if (connector._wallet.id === 'metamask' && typeof window !== 'undefined') {
      const isMetamaskFound = !!window?.ethereum?._metamask
      if (!isMetamaskFound) {
        window.open('https://metamask.io/download/')
        return
      }
    }

    connect({ connector })
  }

  const onConnectInlineEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (signIn.useMock && mockConnector) {
      connect({ connector: mockConnector })
      return
    }

    if (emailConnector) {
      localStorage.setItem(EMAIL_CONNECTOR_LOCAL_STORAGE_KEY, email)
      connect({ connector: emailConnector })
    }
  }

  if (showExtendedList) {
    return (
      <>
        <Box
          as="button"
          position="absolute"
          style={{ top: '20px' }}
          onClick={() => setShowExtendedList(false)}
          className={styles.clickable}
        >
          <ChevronLeftIcon />
        </Box>
        <ExtendedWalletList connectors={walletConnectors} onConnect={onConnect} />
      </>
    )
  }

  return (
    <>
      <Banner config={config as KitConfig} />
      <Box marginTop="5">
        {emailConnector && showEmailInput && (
          <>
            <form onSubmit={onConnectInlineEmail}>
              <TextInput
                /* @ts-ignore-next-line */
                onChange={onChangeEmail}
                value={email}
                name="email"
                placeholder="Enter email"
                data-1p-ignore
              />
              <Button
                type="submit"
                disabled={!isEmailValid(email)}
                marginTop="4"
                width="full"
                label="Continue"
                rightIcon={ChevronRightIcon}
              />
            </form>
          </>
        )}
        {socialAuthConnectors.length > 0 && (
          <>
            {emailConnector && showEmailInput && (
              <>
                <Box style={{ marginBottom: '-4px' }}>
                  <Divider color="backgroundSecondary" />
                </Box>
                <Box justifyContent="center" alignItems="center">
                  <Text variant="small" color="text50">
                    or sign in via
                  </Text>
                </Box>
              </>
            )}
            <Box marginTop="3" gap="2" flexDirection="row" justifyContent="center" alignItems="center" flexWrap="wrap">
              {socialAuthConnectors.map(connector => {
                const Logo =
                  theme === 'dark'
                    ? (connector._wallet.monochromeLogoDark as React.FunctionComponent)
                    : (connector._wallet.monochromeLogoLight as React.FunctionComponent)
                return (
                  <Card
                    key={connector._wallet.id}
                    className={styles.clickable}
                    justifyContent="center"
                    alignItems="center"
                    onClick={() => onConnect(connector)}
                    aspectRatio="1/1"
                    style={{
                      width: `calc(25% - ${vars.space[2]})`
                    }}
                  >
                    <Box
                      className={styles.walletLogoContainer}
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Logo />
                    </Box>
                  </Card>
                )
              })}
            </Box>
          </>
        )}
        {walletConnectors.length > 0 && (
          <>
            {((emailConnector && showEmailInput) || socialAuthConnectors.length > 0) && (
              <>
                <Box style={{ marginBottom: '-4px' }}>
                  <Divider color="backgroundSecondary" />
                </Box>
                <Box justifyContent="center" alignItems="center">
                  <Text variant="small" color="text50">
                    or select a wallet
                  </Text>
                </Box>
              </>
            )}
            <Box marginTop="3" gap="2" flexDirection="row" justifyContent="center" alignItems="center">
              {walletConnectors.map(connector => {
                const Logo =
                  theme === 'dark'
                    ? (connector._wallet.logoDark as React.FunctionComponent) ||
                      (connector._wallet.logoDark as React.FunctionComponent)
                    : (connector._wallet.logoLight as React.FunctionComponent) ||
                      (connector._wallet.logoLight as React.FunctionComponent)
                return (
                  <Card
                    key={connector._wallet.id}
                    className={styles.clickable}
                    justifyContent="center"
                    alignItems="center"
                    onClick={() => onConnect(connector)}
                    aspectRatio="1/1"
                    style={{
                      width: `calc(25% - ${vars.space[2]})`
                    }}
                  >
                    <Box
                      className={styles.walletLogoContainer}
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Logo />
                    </Box>
                  </Card>
                )
              })}
            </Box>
            {/* {displayExtendedListButton && (
                <Box
                  padding="4"
                  marginTop="3"
                  background="backgroundSecondary"
                  width="full"
                  justifyContent="space-between"
                  alignItems="center"
                  borderRadius="md"
                  color="text100"
                  as="button"
                  className={styles.clickable}
                  onClick={() => setShowExtendedList(true)}
                >
                  <Text variant="medium">More options</Text>
                  <ChevronRightIcon />
                </Box>
              )} */}
          </>
        )}
      </Box>
    </>
  )
}

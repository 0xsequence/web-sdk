import {
  Box,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  Divider,
  Text,
  TextInput,
  Spinner,
  Image,
  IconButton,
  ModalPrimitive,
  truncateAddress,
  CloseIcon,
  LinkIcon,
  Tooltip
} from '@0xsequence/design-system'
import { useQueryClient } from '@tanstack/react-query'
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useConnections, useSignMessage } from 'wagmi'

import { LocalStorageKey } from '../../constants'
import { CHAIN_ID_FOR_SIGNATURE } from '../../constants/walletLinking'
import { useKitWallets } from '../../hooks/useKitWallets'
import { useStorage } from '../../hooks/useStorage'
import { useEmailAuth } from '../../hooks/useWaasEmailAuth'
import { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict'
import { useWaasLinkWallet } from '../../hooks/useWaasLinkWallet'
import { ExtendedConnector, KitConfig, LogoProps } from '../../types'
import { isEmailValid } from '../../utils/helpers'
import { AppleWaasConnectButton, ConnectButton, EmailConnectButton, GoogleWaasConnectButton } from '../ConnectButton'
import { KitConnectProviderProps } from '../KitProvider/KitProvider'
import { PoweredBySequence } from '../SequenceLogo'

import { Banner } from './Banner'
import { EmailWaasVerify } from './EmailWaasVerify'
import { ExtendedWalletList } from './ExtendedWalletList'
import { WalletListItem } from './WalletListItem'

interface ConnectWalletContentProps extends KitConnectProviderProps {
  emailConflictInfo?: FormattedEmailConflictInfo | null
  onClose: () => void
  isPreview?: boolean
}

export const Connect = (props: ConnectWalletContentProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const { onClose, emailConflictInfo, config = {} as KitConfig, isPreview = false } = props
  const { signIn = {} } = config
  const storage = useStorage()

  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const projectName = config?.signIn?.projectName

  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false)
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)
  const [showExtendedList, setShowExtendedList] = useState<boolean>(false)
  const { status, connectors, connect } = useConnect()
  const connections = useConnections()
  const { signMessageAsync } = useSignMessage()
  const { wallets, linkedWallets, setActiveWallet, disconnectWallet } = useKitWallets()

  const hasInjectedSequenceConnector = connectors.some(c => c.id === 'app.sequence')

  const hasConnectedSocialWallet = connections.some(c => (c.connector as ExtendedConnector)?._wallet?.type === 'social')

  const waasConnection = connections.find(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas')

  // Setup wallet linking
  const { linkWallet } = useWaasLinkWallet(waasConnection?.connector)

  const [lastConnectedWallet, setLastConnectedWallet] = useState<`0x${string}` | undefined>(undefined)

  useEffect(() => {
    if (!lastConnectedWallet) {
      return
    }
    const tryLinkWallet = async () => {
      console.log('linked wallets', linkedWallets)
      const nonWaasWallets = connections.filter(c => (c.connector as ExtendedConnector)?.type !== 'sequence-waas')
      console.log('nonWaasWallets', nonWaasWallets)
      const nonLinkedWallets = nonWaasWallets.filter(
        c => !linkedWallets?.find(lw => lw.linkedWalletAddress === c.accounts[0].toLowerCase())
      )
      console.log('nonLinkedWallets', nonLinkedWallets)

      if (nonLinkedWallets.map(w => w.accounts[0]).includes(lastConnectedWallet as `0x${string}`)) {
        // make sure active wallet is the one we are trying to link
        const waasWalletAddress = waasConnection?.accounts[0]

        if (!waasWalletAddress) {
          return
        }

        const childMessage = `Link to parent wallet with address ${waasWalletAddress}`

        const childSignature = await signMessageAsync({ account: lastConnectedWallet, message: childMessage })

        if (!childSignature) {
          return
        }

        await linkWallet({
          signatureChainId: CHAIN_ID_FOR_SIGNATURE,
          connectorName: connections.find(c => c.accounts[0] === lastConnectedWallet)?.connector?.name || '',
          childWalletAddress: lastConnectedWallet,
          childMessage,
          childSignature
        })

        await queryClient.invalidateQueries({
          queryKey: ['linkedWallets']
        })
      }

      setLastConnectedWallet(undefined)
      onClose()
    }
    if (connections && connections.length > 1 && waasConnection !== undefined) {
      tryLinkWallet()
    } else {
      setLastConnectedWallet(undefined)
      onClose()
    }
  }, [connections, lastConnectedWallet])

  const baseWalletConnectors = (connectors as ExtendedConnector[])
    .filter(c => {
      return c._wallet && (c._wallet.type === 'wallet' || c._wallet.type === undefined)
    })
    // Remove sequence if wallet extension detected
    .filter(c => {
      if (c._wallet?.id === 'sequence' && hasInjectedSequenceConnector) {
        return false
      }

      return true
    })
  const mockConnector = baseWalletConnectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  const allWallets = useMemo(() => {
    // Get read-only linked wallets that aren't connected
    const readOnlyLinkedWallets = (linkedWallets ?? [])
      .filter(lw => !wallets.some(w => w.address.toLowerCase() === lw.linkedWalletAddress.toLowerCase()))
      .map(lw => ({
        id: lw.linkedWalletAddress,
        name: lw.walletType || 'Linked Wallet',
        address: lw.linkedWalletAddress,
        isEmbedded: false,
        isActive: false,
        isLinked: true,
        isReadOnly: true,
        onDisconnect: () => {} // No-op for read-only wallets
      }))

    // Map and sort connected wallets
    const connectedWallets = wallets.map(wallet => ({
      id: wallet.id,
      name: wallet.name,
      address: wallet.address,
      isEmbedded: wallet.isEmbedded,
      isActive: wallet.isActive,
      isLinked: linkedWallets?.some(lw => lw.linkedWalletAddress.toLowerCase() === wallet.address.toLowerCase()) ?? false,
      isReadOnly: false,
      onDisconnect: () => disconnectWallet(wallet.address)
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
  }, [wallets, linkedWallets])

  // EIP-6963 connectors will not have the _wallet property
  const injectedConnectors: ExtendedConnector[] = connectors
    .filter(c => c.type === 'injected')
    // Remove the injected connectors when another connector is already in the base connectors
    .filter(connector => {
      if (connector.id === 'com.coinbase.wallet') {
        return !connectors.find(connector => (connector as ExtendedConnector)?._wallet?.id === 'coinbase-wallet')
      }
      if (connector.id === 'io.metamask') {
        return !connectors.find(connector => (connector as ExtendedConnector)?._wallet?.id === 'metamask-wallet')
      }

      return true
    })
    .map(connector => {
      const Logo = (props: LogoProps) => {
        return <Image src={connector.icon} alt={connector.name} disableAnimation {...props} />
      }

      return {
        ...connector,
        _wallet: {
          id: connector.id,
          name: connector.name,
          logoLight: Logo,
          logoDark: Logo,
          type: 'wallet'
        }
      }
    })

  const socialAuthConnectors = (connectors as ExtendedConnector[]).filter(c => c._wallet?.type === 'social')
  const walletConnectors = [...baseWalletConnectors, ...injectedConnectors]
  const emailConnector = socialAuthConnectors.find(c => c._wallet.id.includes('email'))
  const isEmailOnly = emailConnector && socialAuthConnectors.length === 1
  const displayExtendedListButton = walletConnectors.length > 7

  const onChangeEmail: React.ChangeEventHandler<HTMLInputElement> = ev => {
    setEmail(ev.target.value)
  }

  useEffect(() => {
    setIsLoading(status === 'pending' || status === 'success')
  }, [status])

  const handleConnect = async (connector: ExtendedConnector) => {
    connect(
      { connector },
      {
        onSettled: result => {
          setLastConnectedWallet(result?.accounts[0])
        }
      }
    )
  }

  const onConnect = (connector: ExtendedConnector) => {
    if (signIn.useMock && mockConnector) {
      handleConnect(mockConnector)
      return
    }

    if (connector._wallet.id === 'email') {
      const email = prompt('Auto-email login, please specify the email address:')

      if ('setEmail' in connector) {
        ;(connector as any).setEmail(email)
      }
    }

    handleConnect(connector)
  }

  const onConnectInlineEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (signIn.useMock && mockConnector) {
      handleConnect(mockConnector)
      return
    }

    if (emailConnector) {
      if ('setEmail' in emailConnector) {
        ;(emailConnector as any).setEmail(email)
      }

      if (emailConnector._wallet.id === 'email-waas') {
        try {
          await initiateEmailAuth(email)
          setShowEmailWaasPinInput(true)
        } catch (e) {
          console.log(e)
        }
      } else {
        handleConnect(emailConnector)
      }
    }
  }

  const {
    inProgress: emailAuthInProgress,
    loading: emailAuthLoading,
    error: emailAuthError,
    initiateAuth: initiateEmailAuth,
    sendChallengeAnswer
  } = useEmailAuth({
    connector: emailConnector,
    onSuccess: async result => {
      if ('signInResponse' in result && result.signInResponse?.email) {
        storage?.setItem(LocalStorageKey.WaasSignInEmail, result.signInResponse.email)
      }

      if (emailConnector) {
        if (result.version === 1) {
          // Store the version 1 idToken so that it can be used to authenticate during a refresh
          storage?.setItem(LocalStorageKey.WaasEmailIdToken, result.idToken)
        }

        handleConnect(emailConnector)
      }
    }
  })

  // Hide the email input if there is an email conflict
  useEffect(() => {
    if (emailConflictInfo) {
      setShowEmailWaasPinInput(false)
    }
  }, [emailConflictInfo])

  return (
    <Box padding="4">
      <Box
        justifyContent="center"
        color="text100"
        alignItems="center"
        fontWeight="medium"
        style={{
          marginTop: '4px'
        }}
      >
        <TitleWrapper isPreview={isPreview}>
          <Text variant="normal">{isLoading ? `Connecting...` : `Sign in ${projectName ? `to ${projectName}` : ''}`}</Text>
        </TitleWrapper>
      </Box>

      {isLoading ? (
        <Box justifyContent="center" alignItems="center" paddingTop="4">
          <Spinner />
        </Box>
      ) : (
        <>
          {showEmailWaasPinInput ? (
            <EmailWaasVerify error={emailAuthError} isLoading={emailAuthLoading} onConfirm={sendChallengeAnswer} />
          ) : showExtendedList ? (
            <>
              <Box position="absolute" top="4">
                <IconButton icon={ChevronLeftIcon} onClick={() => setShowExtendedList(false)} size="xs" />
              </Box>
              <ExtendedWalletList connectors={walletConnectors} onConnect={onConnect} />
            </>
          ) : (
            <>
              <Banner config={config as KitConfig} />

              {wallets.length > 0 && !showEmailInput && (
                <>
                  <Box marginTop="4" flexDirection="column">
                    <Text variant="small" color="text50" marginBottom="1">
                      Connected wallets
                    </Text>
                    <Box position="relative">
                      <Box
                        as={motion.div}
                        paddingY="1"
                        gap="2"
                        flexDirection="column"
                        overflowY="auto"
                        onScroll={e => {
                          const target = e.currentTarget
                          const isScrollable = target.scrollHeight > target.clientHeight
                          const isAtBottom = Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight
                          const isAtTop = target.scrollTop === 0

                          const bottomFadeElement = target.parentElement?.querySelector('.scroll-fade') as HTMLElement
                          const topFadeElement = target.parentElement?.querySelector('.scroll-fade-top') as HTMLElement

                          if (bottomFadeElement) {
                            bottomFadeElement.style.opacity = isScrollable && !isAtBottom ? '1' : '0'
                          }
                          if (topFadeElement) {
                            topFadeElement.style.opacity = isScrollable && !isAtTop ? '1' : '0'
                          }
                        }}
                        style={{
                          maxHeight: '240px',
                          scrollbarWidth: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        <AnimatePresence mode="sync">
                          {allWallets.map((wallet, index) => (
                            <motion.div
                              key={wallet.id}
                              custom={index}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: i => ({
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30,
                                    delay: i * 0.05
                                  }
                                }),
                                exit: {
                                  opacity: 0,
                                  y: -20,
                                  transition: {
                                    duration: 0.15,
                                    ease: 'easeInOut'
                                  }
                                }
                              }}
                            >
                              <WalletListItem
                                name={wallet.name}
                                address={wallet.address}
                                isEmbedded={wallet.isEmbedded}
                                isActive={wallet.isActive}
                                isLinked={wallet.isLinked}
                                isReadOnly={wallet.isReadOnly}
                                onDisconnect={wallet.onDisconnect}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </Box>
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        className="scroll-fade-top"
                        style={{
                          height: '30px',
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0), var(--seq-colors-background-primary))',
                          pointerEvents: 'none',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                      />
                      <Box
                        position="absolute"
                        bottom="0"
                        left="0"
                        right="0"
                        className="scroll-fade"
                        style={{
                          height: '40px',
                          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), var(--seq-colors-background-primary))',
                          pointerEvents: 'none',
                          opacity: 1,
                          transition: 'opacity 0.2s'
                        }}
                      />
                    </Box>

                    <Divider color="backgroundRaised" width="full" />

                    <Box justifyContent="center">
                      <Text variant="small" color="text50">
                        Connect another wallet
                      </Text>
                    </Box>
                  </Box>
                </>
              )}

              <Box marginTop="2">
                {!hasConnectedSocialWallet && emailConnector && (showEmailInput || isEmailOnly) ? (
                  <form onSubmit={onConnectInlineEmail}>
                    <TextInput onChange={onChangeEmail} value={email} name="email" placeholder="Enter email" data-1p-ignore />
                    <Box alignItems="center" justifyContent="center" marginTop="4">
                      {!emailAuthInProgress && (
                        <Box gap="2" width="full">
                          {!isEmailOnly && <Button label="Back" width="full" onClick={() => setShowEmailInput(false)} />}

                          <Button
                            type="submit"
                            variant="primary"
                            disabled={!isEmailValid(email)}
                            width="full"
                            label="Continue"
                            rightIcon={ChevronRightIcon}
                          />
                        </Box>
                      )}
                      {emailAuthInProgress && <Spinner />}
                    </Box>
                  </form>
                ) : (
                  <>
                    {socialAuthConnectors.length > 0 && !hasConnectedSocialWallet && (
                      <Box marginTop="2" gap="2" flexDirection="row" justifyContent="center" alignItems="center" flexWrap="wrap">
                        {socialAuthConnectors.map(connector => {
                          return (
                            <Box key={connector.uid} aspectRatio="1/1" alignItems="center" justifyContent="center">
                              {connector._wallet.id === 'google-waas' ? (
                                <GoogleWaasConnectButton connector={connector} onConnect={onConnect} />
                              ) : connector._wallet.id === 'apple-waas' ? (
                                <AppleWaasConnectButton connector={connector} onConnect={onConnect} />
                              ) : connector._wallet.id.includes('email') ? (
                                <EmailConnectButton onClick={() => setShowEmailInput(true)} />
                              ) : (
                                <ConnectButton connector={connector} onConnect={onConnect} />
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    )}
                  </>
                )}

                {walletConnectors.length > 0 && !showEmailInput && (
                  <>
                    {socialAuthConnectors.length > 0 && !hasConnectedSocialWallet && wallets.length === 0 && (
                      <>
                        <Divider color="backgroundSecondary" />
                        <Box justifyContent="center" alignItems="center">
                          <Text variant="small" color="text50">
                            or select a wallet
                          </Text>
                        </Box>
                      </>
                    )}

                    <Box marginTop="2" gap="2" flexDirection="row" justifyContent="center" alignItems="center">
                      {walletConnectors.slice(0, 7).map(connector => {
                        return <ConnectButton key={connector.uid} connector={connector} onConnect={onConnect} />
                      })}
                    </Box>

                    {displayExtendedListButton && (
                      <Box marginTop="4" justifyContent="center">
                        <Button
                          shape="square"
                          size="xs"
                          onClick={() => setShowExtendedList(true)}
                          label="More options"
                          rightIcon={ChevronRightIcon}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>

              <PoweredBySequence />
            </>
          )}
        </>
      )}
    </Box>
  )
}

const TitleWrapper = ({ children, isPreview }: { children: React.ReactNode; isPreview: boolean }) => {
  if (isPreview) {
    return <>{children}</>
  }

  return <ModalPrimitive.Title asChild>{children}</ModalPrimitive.Title>
}

'use client'

import {
  ArrowRightIcon,
  Button,
  Card,
  Divider,
  IconButton,
  Image,
  ModalPrimitive,
  Spinner,
  Text,
  TextInput,
  useTheme
} from '@0xsequence/design-system'
import { genUserId } from '@databeat/tracker'
import { clsx } from 'clsx'
import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type ReactNode } from 'react'
import { useConnect, useConnections, useSignMessage } from 'wagmi'

import type { SequenceV3Connector } from '../../connectors/wagmiConnectors/sequenceV3Connector.js'
import { EVENT_SOURCE } from '../../constants/analytics.js'
import { CHAIN_ID_FOR_SIGNATURE } from '../../constants/walletLinking.js'
import { useAnalyticsContext } from '../../contexts/Analytics.js'
import { useWallets } from '../../hooks/useWallets.js'
import { useWaasLinkWallet } from '../../hooks/useWaasLinkWallet.js'
import { useWalletSettings } from '../../hooks/useWalletSettings.js'
import type { ConnectConfig, ExtendedConnector, LogoProps } from '../../types.js'
import { formatAddress, isEmailValid } from '../../utils/helpers.js'
import {
  AppleWaasConnectButton,
  ConnectButton,
  EpicWaasConnectButton,
  getLogo,
  GoogleWaasConnectButton,
  GuestWaasConnectButton,
  ShowAllWalletsButton,
  XWaasConnectButton
} from '../ConnectButton/index.js'
import type { SequenceConnectProviderProps } from '../SequenceConnectProvider/index.js'
import { PoweredBySequence } from '../SequenceLogo/index.js'

import { Banner } from './Banner.js'
import { ConnectedWallets } from './ConnectedWallets.js'
import { ExtendedWalletList } from './ExtendedWalletList.js'

const MAX_ITEM_PER_ROW = 4
const SEQUENCE_V3_CONNECTOR_TYPE = 'sequence-v3-wallet'

interface RestorableSessionState {
  connector: ExtendedConnector & SequenceV3Connector
  walletAddress?: string
  loginMethod?: string
}

interface ConnectProps extends SequenceConnectProviderProps {
  onClose: () => void
  isPreview?: boolean
}

export const Connect = (props: ConnectProps) => {
  const { theme } = useTheme()

  const { analytics } = useAnalyticsContext()
  const { hideExternalConnectOptions, hideConnectedWallets, hideSocialConnectOptions } = useWalletSettings()

  const { onClose, config = {} as ConnectConfig, isPreview = false } = props
  const { signIn = {} } = config

  const descriptiveSocials = !!config?.signIn?.descriptiveSocials
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const projectName = config?.signIn?.projectName

  const [email, setEmail] = useState('')

  const [showExtendedList, setShowExtendedList] = useState<null | 'social' | 'wallet' | 'ecosystem'>(null)
  const { status, connectors, connect } = useConnect()
  const { signMessageAsync } = useSignMessage()

  const connections = useConnections()
  const { wallets, linkedWallets, disconnectWallet, refetchLinkedWallets } = useWallets()
  const waasConnection = useMemo(
    () => connections.find(c => (c.connector as ExtendedConnector)?.type === 'sequence-waas'),
    [connections]
  )
  const { linkWallet, removeLinkedWallet } = useWaasLinkWallet(waasConnection?.connector)

  const [lastConnectedWallet, setLastConnectedWallet] = useState<`0x${string}` | undefined>(undefined)
  const [isSigningLinkMessage, setIsSigningLinkMessage] = useState(false)
  const [isRestoringSession, setIsRestoringSession] = useState(false)
  const [restorableSessionDismissed, setRestorableSessionDismissed] = useState(false)
  const [restorableSession, setRestorableSession] = useState<RestorableSessionState | null>(null)

  const handleUnlinkWallet = async (address: string) => {
    try {
      await removeLinkedWallet(address)
      const parentWallet = wallets.find(w => w.isEmbedded)?.address
      try {
        analytics?.track({
          event: 'UNLINK_WALLET',
          props: {
            parentWalletAddress: parentWallet ? getUserIdForEvent(parentWallet) : '',
            linkedWalletAddress: getUserIdForEvent(address),
            linkedWalletType: linkedWallets?.find(lw => lw.linkedWalletAddress === address)?.walletType || '',
            source: EVENT_SOURCE
          }
        })
      } catch (e) {
        console.warn('unlink analytics error:', e)
      }
      refetchLinkedWallets()
    } catch (e) {
      console.warn('unlink error:', e)
    }
  }

  useEffect(() => {
    if (!lastConnectedWallet) {
      return
    }

    const tryLinkWallet = async () => {
      const nonWaasWallets = connections.filter(c => (c.connector as ExtendedConnector)?.type !== 'sequence-waas')

      const nonLinkedWallets = nonWaasWallets.filter(
        c => !linkedWallets?.find(lw => lw.linkedWalletAddress.toLowerCase() === c.accounts[0].toLowerCase())
      )

      if (nonLinkedWallets.map(w => w.accounts[0]).includes(lastConnectedWallet as `0x${string}`)) {
        const waasWalletAddress = waasConnection?.accounts[0]

        if (!waasWalletAddress) {
          return
        }

        const childWalletAddress = lastConnectedWallet
        const childMessage = `Link to parent wallet with address ${waasWalletAddress}`

        setIsSigningLinkMessage(true)
        let childSignature
        try {
          childSignature = await signMessageAsync({ account: lastConnectedWallet, message: childMessage })

          if (!childSignature) {
            return
          }

          await linkWallet({
            signatureChainId: CHAIN_ID_FOR_SIGNATURE,
            connectorName: connections.find(c => c.accounts[0] === lastConnectedWallet)?.connector?.name || '',
            childWalletAddress,
            childMessage,
            childSignature
          })

          try {
            analytics?.track({
              event: 'LINK_WALLET',
              props: {
                parentWalletAddress: getUserIdForEvent(waasWalletAddress),
                linkedWalletAddress: getUserIdForEvent(childWalletAddress),
                linkedWalletType: connections.find(c => c.accounts[0] === lastConnectedWallet)?.connector?.name || '',
                source: EVENT_SOURCE
              }
            })
          } catch (e) {
            console.warn('link analytics error:', e)
          }

          refetchLinkedWallets()
        } catch (e) {
          console.log(e)
        }
      }

      setIsSigningLinkMessage(false)
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

  const hasV3Wallet = wallets.some(w => w.id.includes('-v3'))

  const extendedConnectors = connectors as ExtendedConnector[]

  const sequenceConnectors = useMemo(
    () =>
      extendedConnectors.filter(
        (connector): connector is ExtendedConnector & SequenceV3Connector => connector.type === SEQUENCE_V3_CONNECTOR_TYPE
      ),
    [extendedConnectors]
  )

  const findSequenceConnectorByLoginMethod = useCallback(
    (loginMethod?: string | null) => {
      if (!loginMethod) {
        return undefined
      }
      const normalizedMethod = loginMethod.trim().toLowerCase()
      if (!normalizedMethod) {
        return undefined
      }

      return sequenceConnectors.find(connector => {
        const loginStorageKey = connector.loginOptions?.loginStorageKey?.toLowerCase()
        const loginType = connector.loginOptions?.loginType?.toLowerCase()
        const walletId = connector._wallet?.id?.toLowerCase()

        if (loginStorageKey && loginStorageKey === normalizedMethod) {
          return true
        }
        if (loginType && loginType === normalizedMethod) {
          return true
        }
        if (walletId && (walletId === normalizedMethod || walletId.startsWith(`${normalizedMethod}-`))) {
          return true
        }

        return false
      })
    },
    [sequenceConnectors]
  )

  useEffect(() => {
    if (restorableSessionDismissed) {
      return
    }

    let cancelled = false

    const checkRestorableSession = async () => {
      // disabled for now
      return
      for (const connector of sequenceConnectors) {
        const client = connector.client
        if (!client?.hasRestorableSessionlessConnection) {
          continue
        }

        try {
          const hasSession = await client.hasRestorableSessionlessConnection()
          if (!hasSession) {
            continue
          }

          const info = await client.getSessionlessConnectionInfo()
          const resolvedConnector = findSequenceConnectorByLoginMethod(info?.loginMethod) || connector

          if (resolvedConnector !== connector) {
            const resolvedClient = resolvedConnector.client
            if (!resolvedClient?.hasRestorableSessionlessConnection) {
              continue
            }
            const resolvedHasSession = await resolvedClient.hasRestorableSessionlessConnection()
            if (!resolvedHasSession) {
              continue
            }
          }

          if (!cancelled) {
            setRestorableSession({
              connector: resolvedConnector,
              walletAddress: info?.walletAddress,
              loginMethod: info?.loginMethod
            })
          }
          return
        } catch (error) {
          console.warn('Failed to check restorable Sequence session', error)
        }
      }

      if (!cancelled) {
        setRestorableSession(null)
      }
    }

    if (sequenceConnectors.length > 0) {
      checkRestorableSession()
    } else {
      setRestorableSession(null)
    }

    return () => {
      cancelled = true
    }
  }, [sequenceConnectors, restorableSessionDismissed, findSequenceConnectorByLoginMethod])

  const baseWalletConnectors = extendedConnectors.filter(c => {
    return c._wallet && (c._wallet.type === 'wallet' || c._wallet.type === undefined)
  })

  const mockConnector = baseWalletConnectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  // EIP-6963 connectors will not have the _wallet property
  const injectedConnectors: ExtendedConnector[] = connectors
    .filter(c => c.type === 'injected')
    // Remove the injected connectors when another connector is already in the base connectors
    .filter(connector => {
      if (connector.id === 'com.coinbase.wallet') {
        return !extendedConnectors.find(existing => existing?._wallet?.id === 'coinbase-wallet')
      }
      if (connector.id === 'io.metamask') {
        return !extendedConnectors.find(existing => existing?._wallet?.id === 'metamask-wallet')
      }

      return true
    })
    .map(connector => {
      const Logo = (props: LogoProps) => {
        return <Image src={connector.icon} alt={connector.name} {...props} />
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

  const ecosystemConnectors = extendedConnectors.filter(c => c._wallet?.isEcosystemWallet)

  const socialAuthConnectors = extendedConnectors
    .filter(c => c._wallet?.type === 'social')
    .filter(c => !c._wallet?.id.includes('email'))
    .filter(c => !c._wallet?.isEcosystemWallet)
    .sort((a, b) => {
      const isPasskey = (wallet?: ExtendedConnector['_wallet']) => wallet?.id === 'passkey-v3'
      if (isPasskey(a._wallet) && !isPasskey(b._wallet)) {
        return -1
      }
      if (!isPasskey(a._wallet) && isPasskey(b._wallet)) {
        return 1
      }
      return 0
    })
  const walletConnectors = [...baseWalletConnectors, ...injectedConnectors]

  const shouldHideStandardSocial = ecosystemConnectors.length > 0

  const emailConnector =
    !hideSocialConnectOptions && !shouldHideStandardSocial
      ? extendedConnectors.find(c => c._wallet?.id.includes('email'))
      : undefined

  const renderConnectorButton = (
    connector: ExtendedConnector,
    options?: { isDescriptive?: boolean; disableTooltip?: boolean }
  ) => {
    const commonProps = {
      connector,
      onConnect,
      isDescriptive: options?.isDescriptive,
      disableTooltip: options?.disableTooltip
    }

    switch (connector._wallet?.id) {
      case 'guest-waas':
        return <GuestWaasConnectButton {...commonProps} setIsLoading={setIsLoading} />
      case 'google-waas':
        return <GoogleWaasConnectButton {...commonProps} />
      case 'apple-waas':
        return <AppleWaasConnectButton {...commonProps} />
      case 'epic-waas':
        return <EpicWaasConnectButton {...commonProps} />
      case 'X-waas':
        return <XWaasConnectButton {...commonProps} />
      default:
        return <ConnectButton {...commonProps} />
    }
  }

  const shouldShowRestorableSessionView = !!restorableSession && !restorableSessionDismissed

  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = ev => {
    setEmail(ev.target.value)
  }

  useEffect(() => {
    setIsLoading(status === 'pending' || status === 'success' || isRestoringSession)
  }, [status, isRestoringSession])

  const handleConnect = async (connector: ExtendedConnector) => {
    return connect(
      { connector },
      {
        onSettled: result => {
          setLastConnectedWallet(result?.accounts[0])
        }
      }
    )
  }

  const onDismissRestorableSession = () => {
    setRestorableSession(null)
    setRestorableSessionDismissed(true)
  }

  const onRestoreSession = async () => {
    if (!restorableSession) {
      return
    }
    const connector = restorableSession.connector
    const client = connector.client
    if (!client?.restoreSessionlessConnection) {
      onDismissRestorableSession()
      return
    }

    setIsRestoringSession(true)
    try {
      const restored = await client.restoreSessionlessConnection()
      if (!restored) {
        onDismissRestorableSession()
        return
      }
      onDismissRestorableSession()
      handleConnect(connector)
    } catch (error) {
      console.warn('Failed to restore Sequence session', error)
      onDismissRestorableSession()
    } finally {
      setIsRestoringSession(false)
    }
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

    if (!isEmailValid(email)) {
      return
    }

    if (signIn.useMock && mockConnector) {
      handleConnect(mockConnector)
      return
    }

    if (emailConnector) {
      if ('setEmail' in emailConnector) {
        ;(emailConnector as any).setEmail(email)
      }

      handleConnect(emailConnector)
    }
  }

  const showEcosystemConnectorSection = !hideSocialConnectOptions && ecosystemConnectors.length > 0
  const showSocialConnectorSection = !hideSocialConnectOptions && !shouldHideStandardSocial && socialAuthConnectors.length > 0
  const showEmailInputSection = !hideSocialConnectOptions && !shouldHideStandardSocial && !!emailConnector

  const showMoreEcosystemOptions = ecosystemConnectors.length > MAX_ITEM_PER_ROW
  const showMoreSocialOptions = socialAuthConnectors.length > MAX_ITEM_PER_ROW
  const showMoreWalletOptions = walletConnectors.length > MAX_ITEM_PER_ROW
  const ecosystemConnectorsPerRow =
    showMoreEcosystemOptions && !descriptiveSocials ? MAX_ITEM_PER_ROW - 1 : ecosystemConnectors.length
  const socialConnectorsPerRow = showMoreSocialOptions && !descriptiveSocials ? MAX_ITEM_PER_ROW - 1 : socialAuthConnectors.length
  const walletConnectorsPerRow = showMoreWalletOptions ? MAX_ITEM_PER_ROW - 1 : walletConnectors.length

  if (shouldShowRestorableSessionView && restorableSession) {
    const walletProps = restorableSession.connector._wallet
    const Logo = walletProps ? getLogo(theme, walletProps) : undefined
    const continueTarget =
      walletProps?.isEcosystemWallet && walletProps?.name
        ? walletProps.name
        : restorableSession.walletAddress
          ? formatAddress(restorableSession.walletAddress)
          : walletProps?.name || 'your wallet'
    const continueLabel = `Continue with ${continueTarget}`

    return (
      <div className="p-4">
        <div
          className="flex flex-col justify-center text-primary items-center font-medium"
          style={{
            marginTop: '2px'
          }}
        >
          <TitleWrapper isPreview={isPreview}>
            <Text color="secondary">{isRestoringSession ? 'Connecting...' : 'Continue your session'}</Text>
          </TitleWrapper>
        </div>
        <div className="flex flex-col gap-4 mt-6">
          <Card
            className={clsx('flex gap-3 items-center justify-start w-full h-14 px-4', isRestoringSession && 'opacity-50')}
            clickable={!isRestoringSession}
            onClick={onRestoreSession}
            aria-disabled={isRestoringSession}
          >
            {Logo && <Logo className="w-6 h-6" />}
            <div className="flex flex-col">
              <Text variant="small" color="muted">
                Previous session
              </Text>
              <Text variant="normal" fontWeight="bold" color="primary">
                {continueLabel}
              </Text>
            </div>
          </Card>
          <Button label="Cancel" variant="glass" onClick={onDismissRestorableSession} disabled={isRestoringSession} />
        </div>
        <div className="mt-6">
          <PoweredBySequence />
        </div>
      </div>
    )
  }

  if (showExtendedList) {
    const SEARCHABLE_TRESHOLD = 8
    const connectorsForModal =
      showExtendedList === 'social'
        ? socialAuthConnectors
        : showExtendedList === 'ecosystem'
          ? ecosystemConnectors
          : walletConnectors
    const searchable = connectorsForModal.length > SEARCHABLE_TRESHOLD
    const title =
      showExtendedList === 'social'
        ? 'Continue with a social account'
        : showExtendedList === 'ecosystem'
          ? 'Connect with an ecosystem wallet'
          : 'Choose a wallet'

    return (
      <ExtendedWalletList
        searchable={searchable}
        onGoBack={() => setShowExtendedList(null)}
        onConnect={onConnect}
        renderConnectorButton={connector =>
          renderConnectorButton(connector, {
            isDescriptive: false,
            disableTooltip: false
          })
        }
        connectors={connectorsForModal}
        title={title}
      />
    )
  }

  return (
    <div className="p-4">
      <div
        className="flex flex-col justify-center text-primary items-center font-medium"
        style={{
          marginTop: '2px'
        }}
      >
        <TitleWrapper isPreview={isPreview}>
          <Text color="secondary">
            {isLoading ? `Connecting...` : hasV3Wallet ? 'Wallets' : `Connect ${projectName ? `to ${projectName}` : ''}`}
          </Text>
        </TitleWrapper>

        {isSigningLinkMessage && (
          <div className="mt-4">
            <Text variant="small" color="muted">
              Confirm the signature request to link your account
            </Text>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center pt-4">
          <Spinner />
        </div>
      ) : (
        <>
          {!hideConnectedWallets && wallets.length > 0 && (
            <>
              <ConnectedWallets
                wallets={wallets}
                linkedWallets={linkedWallets}
                disconnectWallet={disconnectWallet}
                unlinkWallet={handleUnlinkWallet}
                connectWallet={handleConnect}
                connectors={walletConnectors}
              />

              <>
                {!hideExternalConnectOptions && (
                  <>
                    <Divider className="text-background-raised w-full" />
                    <div className="flex justify-center">
                      <Text variant="small" color="muted">
                        {!hasV3Wallet ? 'Connect with a social account' : 'Connect another wallet'}
                      </Text>
                    </div>
                  </>
                )}
              </>
            </>
          )}

          <>
            {!hasV3Wallet && (
              <>
                <Banner config={config as ConnectConfig} />

                <div className="flex mt-6 gap-6 flex-col">
                  <>
                    {showEcosystemConnectorSection && (
                      <div
                        className={`flex gap-2 ${descriptiveSocials ? 'flex-col items-start justify-start' : 'flex-row items-center justify-center'}`}
                      >
                        {ecosystemConnectors.slice(0, ecosystemConnectorsPerRow).map(connector => {
                          return (
                            <div className="w-full" key={connector.uid}>
                              {renderConnectorButton(connector, {
                                isDescriptive: descriptiveSocials,
                                disableTooltip: config?.signIn?.disableTooltipForDescriptiveSocials
                              })}
                            </div>
                          )
                        })}
                        {showMoreEcosystemOptions && (
                          <div className="w-full">
                            <ShowAllWalletsButton onClick={() => setShowExtendedList('ecosystem')} />
                          </div>
                        )}
                      </div>
                    )}
                    {!hideSocialConnectOptions && showSocialConnectorSection && (
                      <div
                        className={`flex gap-2 ${descriptiveSocials ? 'flex-col items-start justify-start' : 'flex-row items-center justify-center'}`}
                      >
                        {socialAuthConnectors.slice(0, socialConnectorsPerRow).map(connector => {
                          return (
                            <div className="w-full" key={connector.uid}>
                              {renderConnectorButton(connector, {
                                isDescriptive: descriptiveSocials,
                                disableTooltip: config?.signIn?.disableTooltipForDescriptiveSocials
                              })}
                            </div>
                          )
                        })}
                        {showMoreSocialOptions && (
                          <div className="w-full">
                            <ShowAllWalletsButton onClick={() => setShowExtendedList('social')} />
                          </div>
                        )}
                      </div>
                    )}
                    {!hideSocialConnectOptions && showSocialConnectorSection && showEmailInputSection && (
                      <div className="flex gap-4 flex-row justify-center items-center">
                        <Divider className="mx-0 my-0 text-background-secondary grow" />
                        <Text className="leading-4 h-4 text-sm" variant="normal" fontWeight="medium" color="muted">
                          or
                        </Text>
                        <Divider className="mx-0 my-0 text-background-secondary grow" />
                      </div>
                    )}
                    {showEmailInputSection && (
                      <>
                        <form onSubmit={onConnectInlineEmail}>
                          <TextInput
                            autoFocus
                            onChange={onChangeEmail}
                            value={email}
                            name="email"
                            placeholder="Email address"
                            controls={
                              <>
                                <IconButton type="submit" size="xs" icon={ArrowRightIcon} disabled={!isEmailValid(email)} />
                              </>
                            }
                            data-1p-ignore
                          />
                        </form>
                      </>
                    )}
                  </>
                </div>
              </>
            )}

            {!hideExternalConnectOptions && walletConnectors.length > 0 && (
              <>
                <div className={clsx('flex gap-2 flex-row justify-center items-center', hasV3Wallet ? 'mt-4' : 'mt-6')}>
                  {walletConnectors.slice(0, walletConnectorsPerRow).map(connector => {
                    return (
                      <div key={connector.uid}>
                        {renderConnectorButton(connector, {
                          isDescriptive: false,
                          disableTooltip: false
                        })}
                      </div>
                    )
                  })}
                  {showMoreWalletOptions && <ShowAllWalletsButton onClick={() => setShowExtendedList('wallet')} />}
                </div>
              </>
            )}
            <div className="mt-6">
              <PoweredBySequence />
            </div>
          </>
        </>
      )}
    </div>
  )
}

const TitleWrapper = ({ children, isPreview }: { children: ReactNode; isPreview: boolean }) => {
  if (isPreview) {
    return <>{children}</>
  }

  return <ModalPrimitive.Title asChild>{children}</ModalPrimitive.Title>
}

const getUserIdForEvent = (address: string) => {
  return genUserId(address.toLowerCase(), false, { privacy: { userIdHash: true } }).userId
}

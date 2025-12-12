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
import { useGetWaasStatus } from '@0xsequence/hooks'
import { SequenceWaaS } from '@0xsequence/waas'
import { genUserId } from '@databeat/tracker'
import { clsx } from 'clsx'
import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type ReactNode } from 'react'
import { appleAuthHelpers, useScript } from 'react-apple-signin-auth'
import { useConnect, useConnections, useSignMessage } from 'wagmi'

import type { SequenceV3Connector } from '../../connectors/wagmiConnectors/sequenceV3Connector.js'
import { EVENT_SOURCE } from '../../constants/analytics.js'
import { LocalStorageKey } from '../../constants/localStorage.js'
import { CHAIN_ID_FOR_SIGNATURE } from '../../constants/walletLinking.js'
import { useAnalyticsContext } from '../../contexts/Analytics.js'
import { useStorage } from '../../hooks/useStorage.js'
import { useEmailAuth } from '../../hooks/useWaasEmailAuth.js'
import type { FormattedEmailConflictInfo } from '../../hooks/useWaasEmailConflict.js'
import { useWaasLinkWallet } from '../../hooks/useWaasLinkWallet.js'
import { useWallets } from '../../hooks/useWallets.js'
import { useWalletSettings } from '../../hooks/useWalletSettings.js'
import type { ConnectConfig, ExtendedConnector, LogoProps } from '../../types.js'
import { formatAddress, isEmailValid } from '../../utils/helpers.js'
import type { WalletConfigurationProvider } from '../../utils/walletConfiguration.js'
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
import { EmailWaasVerify } from './EmailWaasVerify.js'
import { ExtendedWalletList } from './ExtendedWalletList.js'

const MAX_ITEM_PER_ROW = 4
const SEQUENCE_V3_CONNECTOR_TYPE = 'sequence-v3-wallet'

const getConnectorProvider = (connector: ExtendedConnector): WalletConfigurationProvider | null => {
  const walletId = connector._wallet?.id?.toLowerCase() || ''

  if (walletId.includes('email')) {
    return 'EMAIL'
  }
  if (walletId.includes('google')) {
    return 'GOOGLE'
  }
  if (walletId.includes('apple')) {
    return 'APPLE'
  }
  if (walletId.includes('passkey')) {
    return 'PASSKEY'
  }

  return null
}

interface RestorableSessionState {
  connector: ExtendedConnector & SequenceV3Connector
  walletAddress?: string
  loginMethod?: string
}

interface ConnectProps extends SequenceConnectProviderProps {
  emailConflictInfo?: FormattedEmailConflictInfo | null
  onClose: () => void
  isInline?: boolean
  enabledProviders?: WalletConfigurationProvider[]
}

export const Connect = (props: ConnectProps) => {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC)

  const { theme } = useTheme()

  const { analytics } = useAnalyticsContext()
  const { hideExternalConnectOptions, hideConnectedWallets, hideSocialConnectOptions } = useWalletSettings()

  const { onClose, emailConflictInfo, config = {} as ConnectConfig, isInline = false } = props
  const { signIn = {} } = config
  const storage = useStorage()

  const descriptiveSocials = !!config?.signIn?.descriptiveSocials
  const showWalletAuthOptionsFirst = config?.signIn?.showWalletAuthOptionsFirst ?? false
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const projectName = config?.signIn?.projectName

  const [email, setEmail] = useState('')
  const [showEmailWaasPinInput, setShowEmailWaasPinInput] = useState(false)

  const [showExtendedList, setShowExtendedList] = useState<null | 'social' | 'wallet' | 'ecosystem'>(null)
  const { status, connectors, connect } = useConnect()
  const { signMessageAsync } = useSignMessage()

  const enabledProviderSet = useMemo(() => {
    if (!props.enabledProviders) {
      return undefined
    }

    return new Set(props.enabledProviders.map(provider => provider.toUpperCase() as WalletConfigurationProvider))
  }, [props.enabledProviders])

  const allowedChainIds = useMemo(() => {
    if (!config?.chainIds || config.chainIds.length === 0) {
      return undefined
    }

    return new Set(config.chainIds)
  }, [config?.chainIds])

  const filteredConnectors = useMemo(
    () =>
      (connectors as ExtendedConnector[]).filter(connector => {
        const connectorChains = Array.isArray((connector as any).chains)
          ? ((connector as any).chains as { id: number }[])
          : undefined

        if (allowedChainIds && connectorChains?.length) {
          const connectorSupportsAllowedChain = connectorChains.some(chain => allowedChainIds.has(chain.id))
          if (!connectorSupportsAllowedChain) {
            return false
          }
        }

        if (!enabledProviderSet) {
          return true
        }

        const provider = getConnectorProvider(connector)
        if (!provider) {
          return true
        }

        return enabledProviderSet.has(provider)
      }),
    [connectors, enabledProviderSet, allowedChainIds]
  )

  const connections = useConnections()
  const { data: waasStatusData } = useGetWaasStatus()
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
  const hasWaasWallet = !!waasConnection
  const hasSequenceWalletConnection = hasV3Wallet || hasWaasWallet
  const hasSocialConnection = connections.some(c => (c.connector as ExtendedConnector)?._wallet?.type === 'social')
  const hasPrimarySequenceConnection = hasSequenceWalletConnection || hasSocialConnection

  const extendedConnectors = filteredConnectors as ExtendedConnector[]

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

  const baseWalletConnectors = extendedConnectors
    .filter(c => {
      return c._wallet && (c._wallet.type === 'wallet' || c._wallet.type === undefined)
    })
    .filter(c => {
      const isMetamaskInjected = typeof window !== 'undefined' && (window as any)?.ethereum?.isMetaMask
      if (c._wallet?.id === 'metamask-wallet' && isMetamaskInjected) {
        return false
      }

      const isCoinbaseInjected = typeof window !== 'undefined' && (window as any)?.ethereum?.isCoinbaseWallet
      if (c._wallet?.id === 'coinbase-wallet' && isCoinbaseInjected) {
        return false
      }

      return true
    })

  const mockConnector = baseWalletConnectors.find(connector => {
    return connector._wallet.id === 'mock'
  })

  // EIP-6963 connectors will not have the _wallet property
  const injectedConnectors: ExtendedConnector[] = filteredConnectors
    .filter(connector => {
      // Keep the connector when it is an EIP-6963 connector
      if (connector.type === 'injected') {
        return true
      }

      // We check if SDK-generated connectors is actually an injected connector
      const isMetamaskInjected = window.ethereum?.isMetaMask

      if ((connector as ExtendedConnector)._wallet?.id === 'metamask-wallet' && isMetamaskInjected) {
        return true
      }

      const isCoinbaseInjected = window.ethereum?.isCoinbaseWallet

      if ((connector as ExtendedConnector)._wallet?.id === 'coinbase-wallet' && isCoinbaseInjected) {
        return true
      }

      return false
    })
    .map(connector => {
      if (connector?._wallet) {
        return connector as ExtendedConnector
      }

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

  const walletConnectors = [...injectedConnectors, ...baseWalletConnectors].filter(connector => {
    // Avoid duplicating ecosystem wallets in the main wallet list until the user already has a primary connection
    return hasPrimarySequenceConnection ? true : !connector._wallet?.isEcosystemWallet
  })

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
    if (connector._wallet.id === 'guest-waas') {
      const sequenceWaaS = new SequenceWaaS({
        projectAccessKey: config.projectAccessKey,
        waasConfigKey: config.waasConfigKey ?? ''
      })

      await sequenceWaaS.signIn({ guest: true }, 'Guest')
    }

    return connect(
      { connector },
      {
        onSuccess: result => {
          if (result?.accounts[0]) {
            config.onConnectSuccess?.(result.accounts[0])
          }
        },
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

      if (emailConnector._wallet.id === 'email-waas') {
        try {
          await sendEmailCode()
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
    sendChallengeAnswer,
    resetError
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

  const sendEmailCode = async () => {
    await initiateEmailAuth(email)
  }

  // Hide the email input if there is an email conflict
  useEffect(() => {
    if (emailConflictInfo) {
      setShowEmailWaasPinInput(false)
    }
  }, [emailConflictInfo])

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

  const WalletConnectorsSection = () => {
    return (
      <div className={clsx('flex gap-2 flex-row justify-center items-center', hasPrimarySequenceConnection ? 'mt-4' : 'mt-6')}>
        {walletConnectors.slice(0, walletConnectorsPerRow).map(connector => {
          return (
            <div key={connector.uid} className="flex-1 min-w-0">
              {renderConnectorButton(connector, {
                isDescriptive: false,
                disableTooltip: false
              })}
            </div>
          )
        })}
        {showMoreWalletOptions && (
          <div className="flex-1 min-w-0">
            <ShowAllWalletsButton onClick={() => setShowExtendedList('wallet')} />
          </div>
        )}
      </div>
    )
  }

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
      <div className={isInline ? 'p-0' : 'p-4'}>
        <div
          className="flex flex-col justify-center text-primary items-center font-medium"
          style={{
            marginTop: isInline ? '0' : '2px'
          }}
        >
          <TitleWrapper isInline={isInline}>
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
        connectors={connectorsForModal}
        isInline={isInline}
        title={title}
      />
    )
  }

  if (waasStatusData?.errorResponse) {
    const errorMessage =
      waasStatusData.errorResponse.status === 451
        ? 'Service unavailable due to legal and geographic restrictions'
        : `Something went wrong. (${waasStatusData.errorResponse.msg})`

    return (
      <div className={isInline ? 'p-0' : 'p-4'}>
        <div
          className="flex flex-col justify-center text-primary items-center font-medium"
          style={{
            marginTop: isInline ? '0' : '2px'
          }}
        >
          <TitleWrapper isInline={isInline}>
            <Text color="secondary">
              {isLoading
                ? `Connecting...`
                : hasPrimarySequenceConnection
                  ? 'Wallets'
                  : `Connect ${projectName ? `to ${projectName}` : ''}`}
            </Text>
          </TitleWrapper>
          <div className="relative flex flex-col items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4 mt-2 mb-2">
              <Text color="secondary" className="text-center text-lg font-medium text-negative">
                {errorMessage}
              </Text>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={isInline ? 'p-0' : 'p-4'}>
      <div
        className="flex flex-col justify-center text-primary items-center font-medium"
        style={{
          marginTop: isInline ? '0' : '2px'
        }}
      >
        <TitleWrapper isInline={isInline}>
          <Text color="secondary">
            {isLoading
              ? `Connecting...`
              : hasPrimarySequenceConnection
                ? 'Wallets'
                : `Connect ${projectName ? `to ${projectName}` : ''}`}
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
          {!hideConnectedWallets && wallets.length > 0 && !showEmailWaasPinInput && (
            <>
              <ConnectedWallets
                wallets={wallets}
                linkedWallets={linkedWallets}
                disconnectWallet={disconnectWallet}
                unlinkWallet={handleUnlinkWallet}
                connectWallet={handleConnect}
                connectors={walletConnectors}
                embeddedWalletTitle={config.embeddedWalletTitle}
              />

              <>
                {!hideExternalConnectOptions && (
                  <>
                    <Divider className="text-background-raised w-full" />
                    <div className="flex justify-center">
                      <Text variant="small" color="muted">
                        {!hasPrimarySequenceConnection ? 'Connect with a social account' : 'Connect another wallet'}
                      </Text>
                    </div>
                  </>
                )}
              </>
            </>
          )}

          <>
            {showEmailWaasPinInput ? (
              <EmailWaasVerify
                sendEmailCode={sendEmailCode}
                error={emailAuthError}
                isLoading={emailAuthLoading}
                onConfirm={sendChallengeAnswer}
                resetError={resetError}
              />
            ) : (
              <>
                {!hasPrimarySequenceConnection && <Banner config={config as ConnectConfig} />}

                {showWalletAuthOptionsFirst && !hideExternalConnectOptions && walletConnectors.length > 0 && (
                  <WalletConnectorsSection />
                )}

                {!hasPrimarySequenceConnection && (
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
                                  {emailAuthInProgress ? (
                                    <Spinner />
                                  ) : (
                                    <IconButton type="submit" size="xs" icon={ArrowRightIcon} disabled={!isEmailValid(email)} />
                                  )}
                                </>
                              }
                              data-1p-ignore
                            />
                          </form>
                        </>
                      )}
                    </>
                  </div>
                )}

                {!showWalletAuthOptionsFirst && !hideExternalConnectOptions && walletConnectors.length > 0 && (
                  <WalletConnectorsSection />
                )}
                <div className="mt-6">
                  <PoweredBySequence />
                </div>
              </>
            )}
          </>
        </>
      )}
    </div>
  )
}

const TitleWrapper = ({ children, isInline }: { children: ReactNode; isInline: boolean }) => {
  if (isInline) {
    return <>{children}</>
  }

  return <ModalPrimitive.Title asChild>{children}</ModalPrimitive.Title>
}

const getUserIdForEvent = (address: string) => {
  return genUserId(address.toLowerCase(), false, { privacy: { userIdHash: true } }).userId
}

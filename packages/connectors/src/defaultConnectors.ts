import { CreateConnectorFn } from 'wagmi'
import { getKitConnectWallets } from '@0xsequence/kit'

import { apple, coinbaseWallet, email, facebook, google, metamask, sequence, twitch, walletConnect } from './connectors'
import { googleWaas } from './connectors/google/googleWaas'
import { emailWaas } from './connectors/email/emailWaas'
import { appleWaas } from './connectors/apple/appleWaas'

interface GetDefaultConnectors {
  walletConnectProjectId: string
  projectAccessKey: string
  appName: string
  defaultChainId?: number
}

export const getDefaultConnectors = ({
  walletConnectProjectId,
  defaultChainId,
  projectAccessKey,
  appName
}: GetDefaultConnectors): CreateConnectorFn[] => {
  const connectors = getKitConnectWallets(projectAccessKey, [
    email({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName,
        projectAccessKey
      }
    }),
    google({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName,
        projectAccessKey
      }
    }),
    facebook({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName,
        projectAccessKey
      }
    }),
    twitch({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    apple({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName
      }
    }),
    sequence({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName,
        projectAccessKey
      }
    }),
    walletConnect({
      projectId: walletConnectProjectId
    }),
    metamask(),
    coinbaseWallet({
      appName
    })
  ])

  /* @ts-ignore-next-line */
  return connectors
}

interface GetDefaultWaasConnectors {
  projectAccessKey: string
  waasConfigKey: string
  googleClientId?: string
  appleClientId?: string
  appleRedirectURI?: string

  walletConnectProjectId: string

  appName: string
  defaultChainId?: number

  enableConfirmationModal?: boolean
}

export const getDefaultWaasConnectors = ({
  projectAccessKey,
  waasConfigKey,
  googleClientId,
  appleClientId,
  appleRedirectURI,
  walletConnectProjectId,
  appName,
  defaultChainId,
  enableConfirmationModal
}: GetDefaultWaasConnectors): CreateConnectorFn[] => {
  const wallets: any[] = [
    // emailWaas({ projectAccessKey, waasConfigKey, enableConfirmationModal, network: defaultChainId }),
    coinbaseWallet({
      appName
    }),
    metamask(),
    walletConnect({
      projectId: walletConnectProjectId
    })
  ]
  if (googleClientId) {
    wallets.push(
      googleWaas({ projectAccessKey, googleClientId, waasConfigKey, enableConfirmationModal, network: defaultChainId })
    )
  }
  if (appleClientId && appleRedirectURI) {
    wallets.push(
      appleWaas({
        projectAccessKey,
        appleClientId,
        appleRedirectURI,
        waasConfigKey,
        enableConfirmationModal,
        network: defaultChainId
      })
    )
  }

  const connectors = getKitConnectWallets(projectAccessKey, wallets)

  /* @ts-ignore-next-line */
  return connectors
}

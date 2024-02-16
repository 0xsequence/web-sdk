import { CreateConnectorFn } from 'wagmi'
import { getKitConnectWallets } from '@0xsequence/kit'

import { apple, coinbaseWallet, email, facebook, google, metamask, sequence, twitch, walletConnect } from './connectors'
import { googleWaas } from './connectors/google/googleWaas'
import { sequenceWaas } from './connectors/sequence/sequence-waas'

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
    coinbaseWallet({
      appName
    }),
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
    metamask(),
    walletConnect({
      projectId: walletConnectProjectId
    }),
    sequence({
      defaultNetwork: defaultChainId,
      connect: {
        app: appName,
        projectAccessKey
      }
    })
  ])

  /* @ts-ignore-next-line */
  return connectors
}

interface GetDefaultWaasConnectors {
  projectAccessKey: string
  waasConfigKey: string
  googleClientId?: string

  walletConnectProjectId: string

  appName: string
  defaultChainId?: number
}

export const getDefaultWaasConnectors = ({
  projectAccessKey,
  waasConfigKey,
  googleClientId,
  walletConnectProjectId,
  appName,
  defaultChainId
}: GetDefaultWaasConnectors): CreateConnectorFn[] => {
  const connectors = getKitConnectWallets(
    projectAccessKey,
    [
      coinbaseWallet({
        appName
      }),

      googleWaas({ config: { projectAccessKey, googleClientId, waasConfigKey } }),
      // facebook({
      //   defaultNetwork: defaultChainId,
      //   connect: {
      //     app: appName,
      //     projectAccessKey
      //   }
      // }),
      // twitch({
      //   defaultNetwork: defaultChainId,
      //   connect: {
      //     app: appName
      //   }
      // }),
      // apple({
      //   defaultNetwork: defaultChainId,
      //   connect: {
      //     app: appName
      //   }
      // }),
      metamask(),
      walletConnect({
        projectId: walletConnectProjectId
      }),
      sequenceWaas({ config: { projectAccessKey, waasConfigKey } })
    ],
    googleClientId
  )

  /* @ts-ignore-next-line */
  return connectors
}

import { createConfig, http, type CreateConfigParameters, type Config } from 'wagmi'

import { getDefaultChains } from './defaultChains'
import {
  DefaultConnectorsProps,
  DefaultWaasConnectorsProps,
  getDefaultConnectors,
  getDefaultWaasConnectors
} from './defaultConnectors'

type DefaultConfigProps = DefaultConnectorsProps &
  Partial<DefaultWaasConnectorsProps> &
  Partial<Omit<CreateConfigParameters, 'client'>>

export const getDefaultConfig = ({
  appName,
  projectAccessKey,
  walletConnectProjectId,
  defaultChainId,

  waasConfigKey,
  googleClientId,
  appleClientId,
  appleRedirectURI,
  enableConfirmationModal,
  isDev,

  ...props
}: DefaultConfigProps): Config => {
  const chains = props.chains || getDefaultChains()
  const transports = props.transports || Object.fromEntries(chains.map(chain => [chain.id, http()]))
  const connectors =
    props.connectors ??
    (waasConfigKey
      ? getDefaultWaasConnectors({
          appName,
          projectAccessKey,
          walletConnectProjectId,
          defaultChainId,

          waasConfigKey,
          googleClientId,
          appleClientId,
          appleRedirectURI,
          enableConfirmationModal,
          isDev
        })
      : getDefaultConnectors({
          appName,
          projectAccessKey,
          walletConnectProjectId,
          defaultChainId
        }))

  const config = createConfig({
    ...props,
    chains,
    transports,
    connectors
  })

  return config
}

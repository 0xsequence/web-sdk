import type { ETHAuthProof } from '@0xsequence/auth'
import type { Theme } from '@0xsequence/design-system'
import type { SequenceHooksEnv } from '@0xsequence/hooks'
import type { FunctionComponent } from 'react'
import type { Connector, CreateConnectorFn } from 'wagmi'

import { LocalStorageKey } from './constants/localStorage.js'

export interface LogoProps {
  className?: string
  style?: React.CSSProperties
}

export type WalletType = 'waas' | 'universal'

export interface WalletProperties {
  id: string
  logoDark: FunctionComponent<LogoProps>
  logoLight: FunctionComponent<LogoProps>
  monochromeLogoDark?: FunctionComponent<LogoProps>
  monochromeLogoLight?: FunctionComponent<LogoProps>
  name: string
  iconBackground?: string
  hideConnectorId?: string | null
  isSequenceBased?: boolean
  type?: 'social' | 'wallet'
}

export type Wallet = WalletProperties & {
  createConnector: (projectAccessKey: string) => CreateConnectorFn
}

export interface WalletField {
  _wallet: WalletProperties
}

export type ExtendedConnector = Connector & WalletField

export interface DisplayedAsset {
  contractAddress: string
  chainId: number
}

export interface EthAuthSettings {
  app?: string
  /** expiry number (in seconds) that is used for ETHAuth proof. Default is 1 week in seconds. */
  expiry?: number
  /** origin hint of the dapp's host opening the wallet. This value will automatically
   * be determined and verified for integrity, and can be omitted. */
  origin?: string
  /** authorizeNonce is an optional number to be passed as ETHAuth's nonce claim for replay protection. **/
  nonce?: number
}

export type ModalPosition =
  | 'center'
  | 'middle-right'
  | 'middle-left'
  | 'top-center'
  | 'top-right'
  | 'top-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'

export interface ConnectConfig {
  projectAccessKey: string
  waasConfigKey?: string
  disableAnalytics?: boolean
  defaultTheme?: Theme
  position?: ModalPosition
  signIn?: {
    logoUrl?: string
    descriptiveSocials?: boolean
    disableTooltipForDescriptiveSocials?: boolean
    projectName?: string
    useMock?: boolean
  }
  displayedAssets?: DisplayedAsset[]
  readOnlyNetworks?: number[]
  ethAuth?: EthAuthSettings
  env?: Partial<SequenceHooksEnv>
  hideExternalConnectOptions?: boolean
  hideSocialConnectOptions?: boolean
  hideConnectedWallets?: boolean
  customCSS?: string
  embeddedWalletTitle?: string
}

export type StorageItem = {
  [LocalStorageKey.EthAuthProof]: ETHAuthProof
  [LocalStorageKey.EthAuthSettings]: EthAuthSettings
  [LocalStorageKey.WaasEmailIdToken]: string
  [LocalStorageKey.WaasGoogleClientID]: string
  [LocalStorageKey.WaasGoogleIdToken]: string
  [LocalStorageKey.WaasEpicAuthUrl]: string
  [LocalStorageKey.WaasEpicIdToken]: string
  [LocalStorageKey.WaasAppleClientID]: string
  [LocalStorageKey.WaasAppleIdToken]: string
  [LocalStorageKey.WaasAppleRedirectURI]: string
  [LocalStorageKey.WaasActiveLoginType]: string
  [LocalStorageKey.WaasSignInEmail]: string
  [LocalStorageKey.WaasXAuthUrl]: string
  [LocalStorageKey.WaasXClientID]: string
  [LocalStorageKey.WaasXRedirectURI]: string
  [LocalStorageKey.WaasXCodeVerifier]: string
  [LocalStorageKey.WaasXIdToken]: string
}

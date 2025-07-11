import type { FunctionComponent } from 'react'
import type { Connector, CreateConnectorFn } from 'wagmi'

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

import { ReactNode } from 'react'

import { AppleLogo } from './ConnectorLogos/AppleLogo'
import { CoinbaseWalletLogo } from './ConnectorLogos/CoinbaseWalletLogo'
import { DiscordLogo } from './ConnectorLogos/DiscordLogo'
import { EmailLogo } from './ConnectorLogos/EmailLogo'
import { FacebookLogo } from './ConnectorLogos/FacebookLogo'
import { GoogleLogo } from './ConnectorLogos/GoogleLogo'
import { MetaMaskLogo } from './ConnectorLogos/MetaMaskLogo'
import { SequenceLogo } from './ConnectorLogos/SequenceLogo'
import { TwitchLogo } from './ConnectorLogos/TwitchLogo'
import { WalletConnectLogo } from './ConnectorLogos/WalletConnectLogo'

export const getConnectorLogo = (connectorId: string, isDarkMode = false): ReactNode => {
  switch (connectorId) {
    case 'apple-waas':
      return <AppleLogo isDarkMode={isDarkMode} />
    case 'email-waas':
      return <EmailLogo isDarkMode={isDarkMode} />
    case 'google-waas':
      return <GoogleLogo />
    case 'apple':
      return <AppleLogo isDarkMode={isDarkMode} />
    case 'coinbase-wallet':
      return <CoinbaseWalletLogo />
    case 'discord':
      return <DiscordLogo isDarkMode={isDarkMode} />
    case 'email':
      return <EmailLogo isDarkMode={isDarkMode} />
    case 'facebook':
      return <FacebookLogo />
    case 'google':
      return <GoogleLogo />
    case 'metamask-wallet':
      return <MetaMaskLogo />
    case 'sequence':
      return <SequenceLogo />
    case 'twitch':
      return <TwitchLogo isDarkMode={isDarkMode} />
    case 'wallet-connect':
      return <WalletConnectLogo />
    default:
      return <></>
  }
}

import { ReactNode } from 'react'

import { AppleLogo } from './AppleLogo'
import { CoinbaseWalletLogo } from './CoinbaseWalletLogo'
import { DiscordLogo } from './DiscordLogo'
import { EmailLogo } from './EmailLogo'
import { FacebookLogo } from './FacebookLogo'
import { GoogleLogo } from './GoogleLogo'
import { MetaMaskLogo } from './MetaMaskLogo'
import { SequenceLogo } from './SequenceLogo'
import { TwitchLogo } from './TwitchLogo'
import { WalletConnectLogo } from './WalletConnectLogo'

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

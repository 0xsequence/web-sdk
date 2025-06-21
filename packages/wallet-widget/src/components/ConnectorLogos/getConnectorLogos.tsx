import type { ReactNode } from 'react'

import { AppleLogo } from './AppleLogo.js'
import { CoinbaseWalletLogo } from './CoinbaseWalletLogo.js'
import { DiscordLogo } from './DiscordLogo.js'
import { EmailLogo } from './EmailLogo.js'
import { FacebookLogo } from './FacebookLogo.js'
import { GoogleLogo } from './GoogleLogo.js'
import { MetaMaskLogo } from './MetaMaskLogo.js'
import { SequenceLogo } from './SequenceLogo.js'
import { TwitchLogo } from './TwitchLogo.js'
import { WalletConnectLogo } from './WalletConnectLogo.js'

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
      return null
  }
}

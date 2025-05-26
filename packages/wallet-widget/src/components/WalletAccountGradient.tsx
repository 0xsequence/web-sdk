import { useWallets } from '@0xsequence/connect'
import { GradientAvatar } from '@0xsequence/design-system'

import { getConnectorLogo } from './ConnectorLogos/getConnectorLogos.js'

export const WalletAccountGradient = ({ accountAddress }: { accountAddress: string }) => {
  const { wallets } = useWallets()

  const LoginIcon = getConnectorLogo(wallets.find(wallet => wallet.address === accountAddress)?.signInMethod || '')

  return (
    <div className="flex relative">
      <div className="relative inline-block">
        <GradientAvatar className="w-11 h-11" size="xl" address={accountAddress || ''} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'black',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '20px',
            width: '20px'
          }}
        >
          <div style={{ width: '14px', height: '14px' }}>{LoginIcon}</div>
        </div>
      </div>
    </div>
  )
}

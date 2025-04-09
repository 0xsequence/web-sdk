import { useWallets } from '@0xsequence/connect'
import { GradientAvatar } from '@0xsequence/design-system'

import { getConnectorLogo } from './ConnectorLogos/getConnectorLogos'

export const WalletAccountGradient = ({
  accountAddress,
  size = 'large'
}: {
  accountAddress: string
  size?: 'small' | 'large'
}) => {
  const { wallets } = useWallets()
  const remSize = size === 'small' ? 8 : 16

  const LoginIcon = getConnectorLogo(wallets.find(wallet => wallet.address === accountAddress)?.signInMethod || '')

  return (
    <div className="flex relative">
      <div className="relative inline-block">
        <GradientAvatar className={`w-${remSize} h-${remSize}`} size="xl" address={accountAddress || ''} />
        <div
          style={{
            position: 'absolute',
            bottom: `-${remSize / 4}px`,
            right: `-${remSize / 4}px`,
            border: `${remSize / 8}px solid black`,
            backgroundColor: 'lightgrey',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: `${remSize / 4}px`
          }}
        >
          <div style={{ width: remSize, height: remSize }}>{LoginIcon}</div>
        </div>
      </div>
    </div>
  )
}

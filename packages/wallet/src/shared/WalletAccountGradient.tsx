import { GradientAvatar, IconProps } from '@0xsequence/design-system'
import { ComponentType } from 'react'

export const WalletAccountGradient = ({
  accountAddress,
  loginIcon: LoginIcon,
  size = 'large'
}: {
  accountAddress: string
  loginIcon: ComponentType<IconProps>
  size?: 'small' | 'large'
}) => {
  const remSize = size === 'small' ? 8 : 16
  return (
    <div className="relative">
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
          <div style={{ width: remSize * 1, height: remSize * 1 }}>
            <LoginIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

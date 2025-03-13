import { GradientAvatar } from '@0xsequence/design-system'

export const GradientAvatarList = ({ accountAddressList, size = 'xs' }: { accountAddressList: string[]; size?: 'xs' | 'md' }) => {
  const firstThreeAddresses = accountAddressList.slice(0, 3)
  const width = size === 'xs' ? firstThreeAddresses.length * 6 + 6 : firstThreeAddresses.length * 12 + 20

  return (
    <div className="flex flex-row relative" style={{ position: 'relative', width: `${width}px` }}>
      {firstThreeAddresses.map((accountAddress, index) => (
        <div
          key={accountAddress}
          style={{
            position: 'absolute',
            top: '50%',
            left: `${index * (size === 'xs' ? 6 : 12)}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <GradientAvatar size={size} address={accountAddress || ''} />
        </div>
      ))}
    </div>
  )
}

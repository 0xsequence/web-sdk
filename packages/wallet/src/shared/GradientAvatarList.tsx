import { GradientAvatar } from '@0xsequence/design-system'

export const GradientAvatarList = ({ accountAddressList }: { accountAddressList: string[] }) => {
  const width = accountAddressList.length * 6 + 4
  return (
    <div className="flex flex-row relative" style={{ position: 'relative', width: `${width}px` }}>
      {accountAddressList.map((accountAddress, index) => (
        <div
          key={accountAddress}
          style={{ position: 'absolute', top: '50%', left: `${index * 6}px`, transform: 'translateY(-50%)' }}
        >
          <GradientAvatar size="xs" address={accountAddress || ''} />
        </div>
      ))}
    </div>
  )
}

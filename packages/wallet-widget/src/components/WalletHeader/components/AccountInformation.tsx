import { formatAddress } from '@0xsequence/connect'
import { Text, GradientAvatar, ChevronUpDownIcon, Card } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

interface AccountInformationProps {
  onClickAccount?: () => void
}

export const AccountInformation = ({ onClickAccount }: AccountInformationProps) => {
  const { address } = useAccount()

  return (
    <Card
      className={`flex gap-1 items-center justify-center select-none rounded-full py-1 px-3 ${onClickAccount ? 'cursor-pointer' : ''}`}
      style={{ width: 'fit-content' }}
      onClick={onClickAccount}
    >
      <GradientAvatar size="sm" address={address || ''} />
      <Text color="primary" fontWeight="medium" variant="normal">
        {formatAddress(address || '')}
      </Text>
      {onClickAccount && <ChevronUpDownIcon className="text-primary" />}
    </Card>
  )
}

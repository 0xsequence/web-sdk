import { formatAddress } from '@0xsequence/connect'
import { Text, GradientAvatar, ChevronDownIcon, Card } from '@0xsequence/design-system'
import React, { forwardRef } from 'react'
import { useAccount } from 'wagmi'

interface AccountInformationProps {
  onClickAccount: () => void
}

export const AccountInformation = forwardRef(({ onClickAccount }: AccountInformationProps, ref) => {
  const { address } = useAccount()

  return (
    <Card
      className="flex gap-1 items-center justify-center select-none cursor-pointer rounded-full py-1 px-3"
      style={{ width: 'fit-content' }}
      onClick={onClickAccount}
      // @ts-ignore-next-line
      ref={ref}
    >
      <GradientAvatar size="sm" address={address || ''} />
      <Text color="primary" fontWeight="medium" variant="normal">
        {formatAddress(address || '')}
      </Text>
      <ChevronDownIcon className="text-primary" />
    </Card>
  )
})

import { Text, GradientAvatar, ChevronDownIcon } from '@0xsequence/design-system'
import { formatAddress } from '@0xsequence/kit'
import React, { forwardRef } from 'react'
import { useAccount } from 'wagmi'

interface AccountInformationProps {
  onClickAccount: () => void
}

export const AccountInformation = forwardRef(({ onClickAccount }: AccountInformationProps, ref) => {
  const { address } = useAccount()

  return (
    <div className="flex gap-2 items-center">
      <div className="flex w-full flex-col items-center justify-center">
        <div
          className="flex gap-2 items-center justify-center relative select-none cursor-pointer"
          onClick={onClickAccount}
          // @ts-ignore-next-line
          ref={ref}
        >
          <GradientAvatar size="sm" address={address || ''} />
          <Text color="primary" fontWeight="medium" variant="normal">
            {formatAddress(address || '')}
          </Text>
          <ChevronDownIcon className="text-primary" />
        </div>
      </div>
    </div>
  )
})

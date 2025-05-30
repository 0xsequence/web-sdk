import { useAddFundsModal } from '@0xsequence/checkout'
import { useWallets } from '@0xsequence/connect'
import { AddIcon, Text } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { WalletSelect } from '../../components/Select/WalletSelect.js'

export const Buy = () => {
  const { address } = useAccount()
  const { setActiveWallet } = useWallets()
  const { triggerAddFunds } = useAddFundsModal()

  const onClickWallet = (address: string) => {
    setActiveWallet(address)
  }

  const onClickAddFunds = () => {
    triggerAddFunds({ walletAddress: address || '' })
  }

  return (
    <div className="flex flex-col justify-center items-center px-4 pb-6 gap-4 w-full">
      <WalletSelect selectedWallet={address || ''} onClick={onClickWallet} />
      <div className="flex justify-center items-center bg-background-secondary rounded-full py-3 px-4 gap-2 w-full hover:opacity-80 cursor-pointer">
        <AddIcon color="white" />
        <Text variant="normal" fontWeight="bold" color="primary" onClick={onClickAddFunds}>
          Add Funds to Selected Wallet
        </Text>
      </div>
    </div>
  )
}

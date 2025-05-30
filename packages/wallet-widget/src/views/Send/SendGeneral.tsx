import { useWallets } from '@0xsequence/connect'
import { useAccount } from 'wagmi'

import { GeneralList } from '../../components/SearchLists/index.js'
import { WalletSelect } from '../../components/Select/WalletSelect.js'

export const SendGeneral = () => {
  const { setActiveWallet } = useWallets()
  const { address } = useAccount()

  const onClickWallet = (address: string) => {
    setActiveWallet(address)
  }

  return (
    <div>
      <div className="px-4">
        <WalletSelect selectedWallet={String(address)} onClick={onClickWallet} />
      </div>
      <GeneralList variant="send" />
    </div>
  )
}

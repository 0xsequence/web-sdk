import { useWallets } from '@0xsequence/connect'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { GeneralList } from '../../components/SearchLists/index.js'
import { WalletSelect } from '../../components/Select/WalletSelect.js'
import { useNavigationHeader } from '../../hooks/useNavigationHeader.js'

export const SendGeneral = () => {
  const { setActiveWallet } = useWallets()
  const { address } = useAccount()
  const { setSelectedTab } = useNavigationHeader()

  const onClickWallet = (address: string) => {
    setActiveWallet(address)
  }

  useEffect(() => {
    setSelectedTab('tokens')
  }, [])

  return (
    <div>
      <div className="px-4">
        <WalletSelect selectedWallet={String(address)} onClick={onClickWallet} />
      </div>
      <GeneralList variant="send" />
    </div>
  )
}

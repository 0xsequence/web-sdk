import type { ConnectedWallet } from '@0xsequence/connect'
import { formatAddress } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'
import { useEffect, useState } from 'react'
import { useConnections } from 'wagmi'

import { useFiatWalletsMap } from '../../hooks/useFiatWalletsMap.js'
import { useSettings } from '../../hooks/useSettings.js'
import { CopyButton } from '../CopyButton.js'
import { WalletAccountGradient } from '../WalletAccountGradient.js'

import { ListCard } from './ListCard.js'

export const ListCardWallet = ({ wallet }: { wallet: ConnectedWallet }) => {
  const { fiatCurrency } = useSettings()
  const { fiatWalletsMap } = useFiatWalletsMap()

  const [signInDisplay, setSignInDisplay] = useState('')

  const connections = useConnections()
  const connector = connections.find(c => c.accounts.find(a => a === wallet.address))?.connector

  useEffect(() => {
    const fetchSignInDisplay = async () => {
      const sequenceWaas = (await connector?.sequenceWaas) as {
        listAccounts: () => Promise<{ accounts: { email: string; type: string }[] }>
      }

      if (sequenceWaas) {
        const sequenceWaasAccounts = await sequenceWaas.listAccounts()
        const waasEmail = sequenceWaasAccounts.accounts.find(account => account.type === 'OIDC')?.email
        let backupEmail = ''
        if (sequenceWaasAccounts.accounts.length > 0) {
          backupEmail = sequenceWaasAccounts.accounts[0].email
        }
        setSignInDisplay(waasEmail || backupEmail)
      } else {
        setSignInDisplay(connector?.name || '')
      }
    }
    fetchSignInDisplay()
  }, [connector])

  return (
    <ListCard
      rightChildren={
        <div className="flex flex-row gap-3 items-center">
          <div className="flex flex-row gap-1 items-center">
            <Text color="muted" variant="small">
              {fiatCurrency.sign}
              {fiatWalletsMap.find(w => w.accountAddress === wallet.address)?.fiatValue}
            </Text>
            <Text color="muted" variant="small">
              {fiatCurrency.symbol}
            </Text>
          </div>
          <CopyButton variant="text" size="md" text={wallet.address} onClick={e => e.stopPropagation()} />
        </div>
      }
    >
      <WalletAccountGradient accountAddress={wallet.address} />
      <div className="flex flex-col">
        <Text className="flex flex-row gap-1 items-center" nowrap color="primary" fontWeight="medium" variant="normal">
          {formatAddress(wallet.address)}
        </Text>
        {signInDisplay && (
          <Text color="muted" variant="small">
            {signInDisplay}
          </Text>
        )}
      </div>
    </ListCard>
  )
}

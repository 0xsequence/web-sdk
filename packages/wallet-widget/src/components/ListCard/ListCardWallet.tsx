import type { ConnectedWallet } from '@0xsequence/connect'
import { truncateAtIndex } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'
import { useEffect, useState } from 'react'
import { useConnections } from 'wagmi'

import { useSettings } from '../../hooks/useSettings.js'
import { useValueRegistry } from '../../hooks/useValueRegistry.js'
import { CopyButton } from '../CopyButton.js'
import { WalletAccountGradient } from '../WalletAccountGradient.js'

import { ListCard } from './ListCard.js'

export const ListCardWallet = ({
  wallet,
  disabled = false,
  isSelected = false,
  rightChildren = null,
  onClick = () => {}
}: {
  wallet: ConnectedWallet
  disabled?: boolean
  isSelected?: boolean
  rightChildren?: React.ReactNode
  onClick?: () => void
}) => {
  const { fiatCurrency } = useSettings()
  const { valueRegistryMap } = useValueRegistry()

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
      disabled={disabled}
      type={isSelected ? 'radio' : 'default'}
      onClick={onClick}
      isSelected={isSelected}
      rightChildren={
        rightChildren ? (
          rightChildren
        ) : (
          <div className="flex flex-row gap-3 items-center">
            <div className="flex flex-row gap-1 items-center">
              <Text color="muted" variant="small">
                {fiatCurrency.sign}
                {valueRegistryMap.find(w => w.accountAddress === wallet.address)?.value}
              </Text>
              <Text color="muted" variant="small">
                {fiatCurrency.symbol}
              </Text>
            </div>
            {disabled && <CopyButton variant="text" size="md" text={wallet.address} onClick={e => e.stopPropagation()} />}
          </div>
        )
      }
    >
      <WalletAccountGradient accountAddresses={[wallet.address]} />
      <div className="flex flex-col">
        <Text className="flex flex-row gap-1 items-center" nowrap color="primary" fontWeight="medium" variant="normal">
          {truncateAtIndex(wallet.address, 13)}
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

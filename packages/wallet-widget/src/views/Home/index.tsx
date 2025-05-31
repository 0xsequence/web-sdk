import { truncateAtIndex, useWallets } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { CopyButton } from '../../components/CopyButton.js'
import { GeneralList } from '../../components/SearchLists/index.js'
import { WalletAccountGradient } from '../../components/WalletAccountGradient.js'
import { useFiatWalletsMap, useSettings } from '../../hooks/index.js'

export const Home = () => {
  const { wallets: allWallets } = useWallets()
  const { fiatCurrency } = useSettings()
  const { totalFiatValue } = useFiatWalletsMap()
  const { connector } = useAccount()

  const { address: accountAddress } = useAccount()
  const [signInDisplay, setSignInDisplay] = useState('')

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
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center w-full px-4">
        <div className="flex flew-row justify-between items-center w-full py-4 gap-4">
          {allWallets.length > 1 ? (
            <WalletAccountGradient accountAddresses={allWallets.map(wallet => wallet.address)} />
          ) : (
            <div className="flex flex-row items-center w-full gap-2">
              <WalletAccountGradient accountAddresses={allWallets.map(wallet => wallet.address)} />
              <div className="flex flex-col">
                <div className="flex flex-row gap-1 items-center">
                  <Text color="primary" fontWeight="medium" variant="normal">
                    {truncateAtIndex(accountAddress || '', 8)}
                  </Text>
                  <CopyButton text={accountAddress || ''} />
                </div>
                {signInDisplay && (
                  <Text color="muted" fontWeight="medium" variant="small">
                    {signInDisplay}
                  </Text>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-end">
            <Text color="muted" variant="small">
              Balance
            </Text>
            <Text color="primary" variant="xlarge" nowrap>
              {fiatCurrency.symbol} {fiatCurrency.sign}
              {totalFiatValue}
            </Text>
          </div>
        </div>
      </div>

      <GeneralList variant="default" />
    </div>
  )
}

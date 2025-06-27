import { useEffect, useState, type ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { SharedContextProvider } from '../../../contexts/Shared.js'

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const { connector } = useAccount()

  const [isGuest, setIsGuest] = useState<boolean>(false)
  const [signInDisplay, setSignInDisplay] = useState<string>('')
  const [sequenceWaasAccounts, setSequenceWaasAccounts] = useState<{ accounts: { email: string; type: string }[] } | null>(null)

  useEffect(() => {
    const fetchSequenceWaasAccounts = async () => {
      const sequenceWaas = connector?.sequenceWaas as {
        listAccounts: () => Promise<{ accounts: { email: string; type: string }[] }>
      }
      if (sequenceWaas) {
        const sequenceWaasAccounts = await sequenceWaas.listAccounts()
        setSequenceWaasAccounts(sequenceWaasAccounts)
      }
    }
    fetchSequenceWaasAccounts()
  }, [connector])

  useEffect(() => {
    if (sequenceWaasAccounts) {
      const isGuestAccount = sequenceWaasAccounts.accounts.some(account => account.type === 'Guest')
      setIsGuest(isGuestAccount)

      if (isGuestAccount) {
        setSignInDisplay('Guest')
        return
      }

      const waasEmail = sequenceWaasAccounts.accounts.find(account => account.type === 'OIDC')?.email
      let backupEmail = ''
      if (sequenceWaasAccounts.accounts.length > 0) {
        backupEmail = sequenceWaasAccounts.accounts[0].email
      }
      setSignInDisplay(waasEmail || backupEmail)
    }
  }, [sequenceWaasAccounts])

  return <SharedContextProvider value={{ isGuest, signInDisplay }}>{children}</SharedContextProvider>
}

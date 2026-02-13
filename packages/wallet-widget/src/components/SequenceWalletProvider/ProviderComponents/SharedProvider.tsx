import { useEffect, useState, type ReactNode } from 'react'
import { useConnection } from 'wagmi'

import { SharedContextProvider } from '../../../contexts/Shared.js'

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const { connector } = useConnection()

  const [isGuest, setIsGuest] = useState<boolean>(false)
  const [signInDisplay, setSignInDisplay] = useState<string>('')
  const [sequenceWaasAccounts, setSequenceWaasAccounts] = useState<{
    accounts: { email: string; type: string; id?: string }[]
    currentAccountId?: string
  } | null>(null)

  useEffect(() => {
    const fetchSequenceWaasAccounts = async () => {
      const sequenceWaas = connector?.sequenceWaas as {
        listAccounts: () => Promise<{ accounts: { email: string; type: string; id?: string }[]; currentAccountId?: string }>
      }
      if (sequenceWaas) {
        const sequenceWaasAccounts = await sequenceWaas.listAccounts()
        setSequenceWaasAccounts(sequenceWaasAccounts)
      }
    }

    fetchSequenceWaasAccounts()

    const handleAccountsUpdated = () => {
      fetchSequenceWaasAccounts()
    }

    window.addEventListener('sequence:waas-accounts-updated', handleAccountsUpdated)

    return () => {
      window.removeEventListener('sequence:waas-accounts-updated', handleAccountsUpdated)
    }
  }, [connector])

  useEffect(() => {
    if (sequenceWaasAccounts) {
      const { accounts, currentAccountId } = sequenceWaasAccounts
      const current = accounts.find(account => account.id && account.id === currentAccountId) || accounts[0]
      const nonGuestAccount = accounts.find(account => account.type !== 'Guest')

      const guestOnly = accounts.length > 0 && accounts.every(account => account.type === 'Guest')
      setIsGuest(guestOnly)

      if (guestOnly) {
        setSignInDisplay('Guest')
        return
      }

      const waasEmail = accounts.find(account => account.type === 'OIDC')?.email || nonGuestAccount?.email
      setSignInDisplay(waasEmail || current?.email || '')
    }
  }, [sequenceWaasAccounts])

  return <SharedContextProvider value={{ isGuest, signInDisplay }}>{children}</SharedContextProvider>
}

import { createContext, useRef, RefObject } from 'react'

const WalletContentRefContext = createContext<RefObject<HTMLDivElement | null>>({ current: null })

const WalletContentRefProvider = ({ children }: { children: React.ReactNode }) => {
  const walletContentRef = useRef<HTMLDivElement | null>(null)

  return <WalletContentRefContext.Provider value={walletContentRef}>{children}</WalletContentRefContext.Provider>
}

export { WalletContentRefContext, WalletContentRefProvider }

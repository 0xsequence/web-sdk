'use client'

import { useConnect } from 'wagmi'

export const WalletOptions = () => {
  const { connectors, connect } = useConnect()

  return (
    <div className="flex flex-col gap-1">
      {connectors.map(connector => (
        <button key={connector.uid} onClick={() => connect({ connector })} className="border-2 border-slate-700 px-2 py-1">
          {(connector as any)._wallet?.name || connector.name} <span className="text-sm text-slate-600">({connector.type})</span>
        </button>
      ))}
    </div>
  )
}

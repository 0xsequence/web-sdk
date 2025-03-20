import { SequenceCheckoutProvider } from '@0xsequence/checkout'

import { IntegratedWallet } from './components/IntegratedWallet'

export const Home = () => {
  return (
    <SequenceCheckoutProvider>
      <div className="flex flex-col px-4 pb-4 gap-4">
        <IntegratedWallet />
      </div>
    </SequenceCheckoutProvider>
  )
}

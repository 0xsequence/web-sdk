import { SequenceCheckoutProvider } from '@0xsequence/checkout'

import { IntegratedWallet } from './components/IntegratedWallet'

export const Home = () => {
  return (
    <SequenceCheckoutProvider>
      <div className="flex px-4 pb-5 gap-4 flex-col">
        <IntegratedWallet />
      </div>
    </SequenceCheckoutProvider>
  )
}

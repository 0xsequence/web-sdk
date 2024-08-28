import { Box } from '@0xsequence/design-system'

import { PayWithMainCurrency } from './PayWithMainCurrency'
import { SwapAndPay } from './SwapAndPay'
import { PayWithCryptoSettings } from '../../../contexts'

interface PayWithCryptoProps {
  settings: PayWithCryptoSettings
}

export const PayWithCrypto = ({
  settings
}: PayWithCryptoProps) => {
  const { enableSwapPayments } = settings

  return (
    <>
      <PayWithMainCurrency settings={settings} />
      {enableSwapPayments && (
        <SwapAndPay settings={settings} />
      )}
    </>
  )
}
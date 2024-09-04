import { useState } from 'react'

import { PayWithMainCurrency } from './PayWithMainCurrency'
import { SwapAndPay } from './SwapAndPay'
import { PayWithCryptoSettings } from '../../../contexts'

interface PayWithCryptoProps {
  settings: PayWithCryptoSettings
  disableButtons: boolean
  setDisableButtons: React.Dispatch<React.SetStateAction<boolean>>
}

export const PayWithCrypto = ({
  settings,
  disableButtons,
  setDisableButtons
}: PayWithCryptoProps) => {
  const { enableSwapPayments } = settings

  return (
    <>
      <PayWithMainCurrency
        settings={settings}
        disableButtons={disableButtons}
        setDisableButtons={setDisableButtons}
      />
      {enableSwapPayments && (
        <SwapAndPay
          settings={settings}
          disableButtons={disableButtons}
          setDisableButtons={setDisableButtons}
        />
      )}
    </>
  )
}
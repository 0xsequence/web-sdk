import { useState } from 'react'

import { Box, Button, Text, TextInput, SearchIcon, Scroll } from '@0xsequence/design-system'
import { PayWithMainCurrency } from './PayWithMainCurrency'
import { SwapAndPay } from './SwapAndPay'
import { SelectPaymentSettings } from '../../../contexts'

interface PayWithCryptoProps {
  settings: SelectPaymentSettings
  disableButtons: boolean
  setDisableButtons: React.Dispatch<React.SetStateAction<boolean>>
}

export const PayWithCrypto = ({
  settings,
  disableButtons,
  setDisableButtons
}: PayWithCryptoProps) => {
  const { enableSwapPayments = true, enableMainCurrencyPayment = true } = settings
  const [search, setSearch] = useState('')

  return (
    <Box>
      <Box width="full" marginTop="4">
        <TextInput
          autoFocus
          name="Search"
          leftIcon={SearchIcon}
          value={search}
          onChange={ev => setSearch(ev.target.value)}
          placeholder="Search your wallet"
          data-1p-ignore
        />
      </Box>
      <Box marginTop="3" >
        <Text
          variant="small"
          fontWeight="medium"
          color="text50"
        >
          Select a cryptocurrency
        </Text>
      </Box>
      <Scroll paddingTop="3" style={{ height: '285px' }}>
        {enableMainCurrencyPayment && (
          <PayWithMainCurrency
            settings={settings}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          />
        )}
        {enableSwapPayments && (
          <SwapAndPay
            settings={settings}
            disableButtons={disableButtons}
            setDisableButtons={setDisableButtons}
          />
        )}
      </Scroll>
      <Button
        marginTop="2"
        shape="square"
        variant="primary"
        width="full"
        label="Complete Purchase"
      />
    </Box>
  )
}
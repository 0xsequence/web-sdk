import { Box } from '@0xsequence/design-system'

import { PayWithCreditCardSettings } from '../../contexts'

interface PayWithCreditCardProps {
  settings: PayWithCreditCardSettings
}

export const PayWithCreditCard = ({
  settings
}: PayWithCreditCardProps) => {
  return (
    <Box>
      Pay with credit card options
    </Box>
  )
}
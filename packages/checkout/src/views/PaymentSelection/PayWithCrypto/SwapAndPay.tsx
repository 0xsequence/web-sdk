import { Card, Text } from '@0xsequence/design-system'

import { PayWithCryptoSettings } from '../../../contexts'

interface SwapAndPayProps {
  settings: PayWithCryptoSettings
}

export const SwapAndPay = ({
  settings
}: SwapAndPayProps) => {
  return (
    <Card>
      <Text color="text100">
        Swap and pay options
      </Text>
    </Card>
  )
}
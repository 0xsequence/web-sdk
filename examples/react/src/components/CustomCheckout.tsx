import { Text, Button, Spinner } from '@0xsequence/design-system'
import { useCheckoutUI } from '@0xsequence/checkout'

export const CustomCheckout = () => {
  const { orderSummary, creditCardPayment, cryptoPayment } = useCheckoutUI()

  console.log('orderSummary', orderSummary)
  console.log('creditCardPayment', creditCardPayment)
  console.log('cryptoPayment', cryptoPayment)

  return (
    <div className="flex pt-16 pb-8 px-6 gap-2 flex-col">
      <Text color="primary">Custom Checkout</Text>
    </div>
  )
}

export default CustomCheckout

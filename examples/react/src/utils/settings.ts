import { CheckoutSettings } from '@0xsequence/kit-checkout'

export const getCheckoutSettings = (address?: string) => {
  const checkoutSettings: CheckoutSettings = {
    cryptoCheckout: {
      chainId: 137,
      triggerTransaction: async () => {
        console.log('triggered transaction')
      },
      coinQuantity: {
        contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        amountRequiredRaw: '10000000000'
      }
    },
    orderSummaryItems: [
      {
        contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
        tokenId: '66597',
        quantityRaw: '100'
      },
      {
        contractAddress: '0x624e4fa6980afcf8ea27bfe08e2fb5979b64df1c',
        tokenId: '1741',
        quantityRaw: '100'
      }
    ]
  }

  return checkoutSettings
}

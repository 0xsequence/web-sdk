import { useCreditCardCheckoutModalContext, type CreditCardCheckoutSettings } from '../contexts/CreditCardCheckout.js'

/**
 * Return type for the useCreditCardCheckoutModal hook.
 *
 * @property {function(settings: CreditCardCheckoutSettings): void} initiateCreditCardCheckout - Function to open the Checkout modal
 * @property {function(): void} closeCheckout - Function to close the Checkout modal
 * @property {CreditCardCheckoutSettings|undefined} settings - Current settings for the Checkout modal
 */
type UseCheckoutModalReturnType = {
  initiateCreditCardCheckout: (settings: CreditCardCheckoutSettings) => void
  closeCreditCardCheckout: () => void
  settings: CreditCardCheckoutSettings | undefined
}

/**
 * Hook to manage the Credit Card Checkout modal that allows users to complete purchases using credit card.
 *
 * This hook provides methods to open and close the checkout modal, and access its current settings.
 *
 * Go to {@link https://docs.sequence.xyz/sdk/web/checkout-sdk/hooks/useCreditCardCheckoutModal} for more detailed documentation.
 *
 * @returns An object containing functions and settings for the Checkout modal {@link UseCreditCardCheckoutModalReturnType}
 *
 * @example
 * ```tsx
 * import { useCreditCardCheckoutModal } from '@0xsequence/checkout'
 * import { ChainId } from '@0xsequence/network'
 * import { getOrderbookCalldata } from '../utils'
 *
 * const YourComponent = () => {
 *   const { address } = useAccount()
 *   const { initiateCreditCardCheckout } = useCreditCardCheckoutModal()
 *
 *   const handleCheckout = () => {
 *     // NFT purchase settings
 *     const chainId = ChainId.POLYGON
 *     const orderbookAddress = '0xB537a160472183f2150d42EB1c3DD6684A55f74c'
 *     const nftQuantity = '1'
 *     const orderId = 'your-order-id'
 *     const tokenContractAddress = '0xabcdef...' // NFT contract address
 *     const tokenId = '123' // NFT token ID
 *
 *     initiateCreditCardCheckout({
 *       chainId,
 *       contractAddress: orderbookAddress,
 *       recipientAddress: address || '',
 *       currencyQuantity: '100000',
 *       currencySymbol: 'USDC',
 *       currencyAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
 *       currencyDecimals: '6',
 *       nftId: tokenId,
 *       nftAddress: tokenContractAddress,
 *       nftQuantity,
 *       approvedSpenderAddress: orderbookAddress,
 *       calldata: getOrderbookCalldata({
 *         orderId,
 *         quantity: nftQuantity,
 *         recipient: address || ''
 
 *     })
 *   }
 *
 *   return (
 *     <button onClick={handleCheckout}>
 *       Checkout
 *     </button>
 *   )
 * }
 * ```
 */
export const useCreditCardCheckoutModal = (): UseCheckoutModalReturnType => {
  const { initiateCreditCardCheckout, closeCreditCardCheckout, settings } = useCreditCardCheckoutModalContext()

  return { initiateCreditCardCheckout, closeCreditCardCheckout, settings }
}

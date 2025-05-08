import { useCheckoutModalContext, type CheckoutSettings } from '../contexts/CheckoutModal.js'

/**
 * Return type for the useCheckoutModal hook.
 *
 * @property {function(settings: CheckoutSettings): void} triggerCheckout - Function to open the Checkout modal
 * @property {function(): void} closeCheckout - Function to close the Checkout modal
 * @property {CheckoutSettings|undefined} settings - Current settings for the Checkout modal
 */
type UseCheckoutModalReturnType = {
  triggerCheckout: (settings: CheckoutSettings) => void
  closeCheckout: () => void
  settings: CheckoutSettings | undefined
}

/**
 * Hook to manage the Checkout modal that allows users to complete purchases using various payment methods.
 *
 * This hook provides methods to open and close the checkout modal, and access its current settings.
 * Checkout supports credit card payments and crypto payments for purchasing digital assets.
 *
 * Go to {@link https://docs.sequence.xyz/sdk/web/hooks/useCheckoutModal} for more detailed documentation.
 *
 * @returns An object containing functions and settings for the Checkout modal {@link UseCheckoutModalReturnType}
 *
 * @example
 * ```tsx
 * import { useCheckoutModal } from '@0xsequence/checkout'
 * import { ChainId } from '@0xsequence/network'
 * import { getOrderbookCalldata } from '../utils'
 *
 * const YourComponent = () => {
 *   const { address } = useAccount()
 *   const { triggerCheckout } = useCheckoutModal()
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
 *     triggerCheckout({
 *       creditCardCheckout: {
 *         chainId,
 *         contractAddress: orderbookAddress,
 *         recipientAddress: address || '',
 *         currencyQuantity: '100000',
 *         currencySymbol: 'USDC',
 *         currencyAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
 *         currencyDecimals: '6',
 *         nftId: tokenId,
 *         nftAddress: tokenContractAddress,
 *         nftQuantity,
 *         approvedSpenderAddress: orderbookAddress,
 *         calldata: getOrderbookCalldata({
 *           orderId,
 *           quantity: nftQuantity,
 *           recipient: address || ''
 *         }),
 *         onSuccess: (txHash) => console.log('Success!', txHash)
 *       },
 *       orderSummaryItems: [
 *         {
 *           title: 'NFT #' + tokenId,
 *           subtitle: 'Your Collection',
 *           imageUrl: 'https://example.com/nft.png'
 *         }
 *       ]
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
export const useCheckoutModal = (): UseCheckoutModalReturnType => {
  const { triggerCheckout, closeCheckout, settings } = useCheckoutModalContext()

  return { triggerCheckout, closeCheckout, settings }
}

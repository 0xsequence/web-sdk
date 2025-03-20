import { SelectPaymentSettings, useSelectPaymentContext } from '../contexts/SelectPaymentModal'

/**
 * Return type for the useSelectPaymentModal hook.
 *
 * @property {function(settings: SelectPaymentSettings): void} openSelectPaymentModal - Function to open the Payment Selection modal
 * @property {function(): void} closeSelectPaymentModal - Function to close the Payment Selection modal
 * @property {SelectPaymentSettings|undefined} selectPaymentSettings - Current settings for the Payment Selection modal
 */
type UseSelectPaymentModalReturnType = {
  openSelectPaymentModal: (settings: SelectPaymentSettings) => void
  closeSelectPaymentModal: () => void
  selectPaymentSettings: SelectPaymentSettings | undefined
}

/**
 * Hook to manage the Payment Selection modal that allows users to purchase digital assets with multiple payment options.
 *
 * This hook provides methods to open and close the payment selection modal, and access its current settings.
 * The Payment Selection modal offers various payment methods including:
 * - Pay with cryptocurrency from the user's wallet
 * - Swap tokens to pay with a different cryptocurrency
 * - Pay with credit/debit card
 * - Receive funds from another wallet
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useSelectPaymentModal} for more detailed documentation.
 *
 * @returns An object containing functions to control the Payment Selection modal and its state {@link UseSelectPaymentModalReturnType}
 *
 * @example
 * ```tsx
 * import { useSelectPaymentModal } from '@0xsequence/checkout'
 * import { encodeFunctionData, toHex } from 'viem'
 * import { useAccount } from 'wagmi'
 *
 * const YourComponent = () => {
 *   const { address } = useAccount()
 *   const { openSelectPaymentModal } = useSelectPaymentModal()
 *
 *   const handleCheckout = () => {
 *     if (!address) return
 *
 *     // ERC-20 payment settings
 *     const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // USDC on Polygon
 *     const salesContractAddress = '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b'
 *     const collectionAddress = '0xdeb398f41ccd290ee5114df7e498cf04fac916cb'
 *     const price = '20000' // Price in smallest unit (0.02 USDC)
 *     const chainId = 137 // Polygon
 *
 *     // NFT details
 *     const collectibles = [
 *       {
 *         tokenId: '1',
 *         quantity: '1'
 *       }
 *     ]
 *
 *     // Transaction data for the ERC-1155 mint function
 *     const purchaseTransactionData = encodeFunctionData({
 *       abi: ERC_1155_SALE_CONTRACT, // Your contract ABI
 *       functionName: 'mint',
 *       args: [
 *         address,
 *         collectibles.map(c => BigInt(c.tokenId)),
 *         collectibles.map(c => BigInt(c.quantity)),
 *         toHex(0),
 *         currencyAddress,
 *         price,
 *         [toHex(0, { size: 32 })]
 *       ]
 *     })
 *
 *     // Open the payment selection modal
 *     openSelectPaymentModal({
 *       collectibles,
 *       chain: chainId,
 *       price,
 *       targetContractAddress: salesContractAddress,
 *       recipientAddress: address,
 *       currencyAddress,
 *       collectionAddress,
 *       creditCardProviders: ['sardine', 'transak'],
 *       transakConfig: {
 *         contractId: 'your-contract-id',
 *         apiKey: 'your-api-key'
 *       },
 *       copyrightText: 'ⓒ2024 Your Company',
 *       onSuccess: (txnHash: string) => {
 *         console.log('success!', txnHash)
 *       },
 *       onError: (error: Error) => {
 *         console.error(error)
 *       },
 *       onClose: () => {
 *         console.log('modal closed!')
 *       },
 *       txData: purchaseTransactionData
 *     })
 *   }
 *
 *   return (
 *     <button onClick={handleCheckout}>
 *       Buy NFT with multiple payment options
 *     </button>
 *   )
 * }
 * ```
 */
export const useSelectPaymentModal = (): UseSelectPaymentModalReturnType => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentContext()

  return { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings }
}

import { type CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'
import { encodeFunctionData, toHex, zeroAddress, type Abi, type Hex } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

import { ERC_1155_SALE_CONTRACT } from '../constants/abi.js'
import type { SelectPaymentSettings } from '../contexts/SelectPaymentModal.js'

import { useCheckoutOptionsSalesContract } from './useCheckoutOptionsSalesContract.js'
import { useSelectPaymentModal } from './useSelectPaymentModal.js'

/**
 * Return type for the useERC1155SaleContractCheckout hook.
 *
 * @property Function to open the checkout modal `openCheckoutModal`
 * @property Function to close the checkout modal `closeCheckoutModal`
 * @property Current payment settings for the modal `selectPaymentSettings`
 * @property Whether the contract data is still loading `isLoading`
 * @property Whether there was an error loading the contract data `isError`
 */
interface UseERC1155SaleContractCheckoutReturnType {
  openCheckoutModal: () => void
  closeCheckoutModal: () => void
  selectPaymentSettings?: SelectPaymentSettings
  isLoading: boolean
  isError: boolean
}

type SaleContractSettings = Omit<
  SelectPaymentSettings,
  'txData' | 'collectibles' | 'price' | 'currencyAddress' | 'recipientAddress' | 'targetContractAddress'
>

export const getERC1155SaleContractConfig = ({
  chain,
  price,
  currencyAddress = zeroAddress,
  recipientAddress,
  collectibles,
  collectionAddress,
  ...restProps
}: Omit<SelectPaymentSettings, 'txData'>): SelectPaymentSettings => {
  const purchaseTransactionData = encodeFunctionData({
    abi: ERC_1155_SALE_CONTRACT,
    functionName: 'mint',
    // [to, tokenIds, amounts, data, expectedPaymentToken, maxTotal, proof]
    args: [
      recipientAddress,
      collectibles.map(c => BigInt(c.tokenId || '')),
      collectibles.map(c => BigInt(c.quantity)),
      toHex(0),
      currencyAddress,
      price,
      [toHex(0, { size: 32 })]
    ]
  })

  return {
    chain,
    price,
    currencyAddress,
    recipientAddress,
    collectibles,
    collectionAddress,
    txData: purchaseTransactionData,
    ...restProps
  }
}

/**
 * Hook for enabling ERC-1155 NFT purchases using a standard sale contract.
 *
 * This hook simplifies the process of purchasing ERC-1155 tokens by automatically:
 * - Fetching price information from the sale contract
 * - Determining payment options (crypto, credit card, etc.)
 * - Generating the proper transaction data
 * - Opening and managing the checkout modal
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useERC1155SaleContractCheckout} for more detailed documentation.
 *
 * @param {object} params - Configuration options for the ERC-1155 sale contract checkout
 * @param {number} params.chain - Chain ID where the sale contract is deployed
 * @param {string} params.contractAddress - Address of the ERC-1155 sale contract
 * @param {string} params.wallet - Address of the wallet that will receive the NFTs
 * @param {string} params.collectionAddress - Address of the ERC-1155 token contract
 * @param {Array<{tokenId: string, quantity: string}>} params.items - Array of token IDs and quantities to purchase
 * @param {function} [params.onSuccess] - Callback function when the transaction is successful
 * @param {function} [params.onError] - Callback function when an error occurs
 * @param {function} [params.onClose] - Callback function when the modal is closed
 *
 * @returns Object containing functions to control the checkout modal and state {@link UseERC1155SaleContractCheckoutReturnType}
 *
 * @example
 * ```tsx
 * import { useERC1155SaleContractCheckout } from "@0xsequence/checkout";
 * import { useAccount } from "wagmi";
 *
 * const MyComponent = () => {
 *   const { address: userAddress } = useAccount();
 *   const { openCheckoutModal } = useERC1155SaleContractCheckout({
 *     chain: 80001, // chainId of the chain the collectible is on
 *     contractAddress: "0x0327b2f274e04d292e74a06809bcd687c63a4ba4", // address of the contract handling the minting function
 *     wallet: userAddress!, // address of the recipient
 *     collectionAddress: "0x888a322db4b8033bac3ff84412738c096f87f9d0", // address of the collection contract
 *     items: [
 *       // array of collectibles to purchase
 *       {
 *         tokenId: "0",
 *         quantity: "1",
 *       },
 *     ],
 *     onSuccess: (txnHash: string) => {
 *       console.log("success!", txnHash);
 *     },
 *     onError: (error: Error) => {
 *       console.error(error);
 *     },
 *   });
 *
 *   const onClick = () => {
 *     if (!userAddress) {
 *       return;
 *     }
 *     openCheckoutModal();
 *   };
 *
 *   return <button onClick={onClick}>Buy ERC-1155 collectible!</button>;
 * };
 * ```
 */
export const useERC1155SaleContractCheckout = ({
  chain,
  contractAddress,
  wallet,
  collectionAddress,
  items,
  ...restArgs
}: CheckoutOptionsSalesContractArgs & SaleContractSettings): UseERC1155SaleContractCheckoutReturnType => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const {
    data: checkoutOptions,
    isLoading: isLoadingCheckoutOptions,
    isError: isErrorCheckoutOptions
  } = useCheckoutOptionsSalesContract(chain, {
    chainId: chain.toString(),
    contractAddress,
    wallet,
    collectionAddress,
    items
  })
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const {
    data: saleConfigData,
    isLoading: isLoadingSaleConfig,
    isError: isErrorSaleConfig
  } = useSaleContractConfig({ chainId, contractAddress, tokenIds: items.map(i => i.tokenId) })

  const isLoading = isLoadingCheckoutOptions || isLoadingSaleConfig
  const error = isErrorCheckoutOptions || isErrorSaleConfig

  const openCheckoutModal = () => {
    if (isLoading || error) {
      console.error('Error loading checkout options or sale config', { isLoading, error })
      return
    }

    openSelectPaymentModal(
      getERC1155SaleContractConfig({
        collectibles: items.map(item => ({
          tokenId: item.tokenId,
          quantity: item.quantity
        })),
        chain: chainId,
        price: items
          .reduce((acc, item) => {
            const price = BigInt(saleConfigData?.saleConfigs.find(sale => sale.tokenId === item.tokenId)?.price || 0)

            return acc + BigInt(item.quantity) * price
          }, BigInt(0))
          .toString(),
        currencyAddress: saleConfigData?.currencyAddress || '',
        recipientAddress: wallet,
        collectionAddress,
        targetContractAddress: contractAddress,
        creditCardProviders: checkoutOptions?.options.nftCheckout || [],
        onRampProvider: checkoutOptions?.options.onRamp?.[0],
        ...restArgs
      })
    )
  }

  return {
    openCheckoutModal,
    closeCheckoutModal: closeSelectPaymentModal,
    selectPaymentSettings,
    isLoading,
    isError: error
  }
}

interface UseSaleContractConfigArgs {
  chainId: number
  contractAddress: string
  tokenIds: string[]
}

interface SaleConfig {
  tokenId: string
  price: string
}

interface UseSaleContractConfigData {
  currencyAddress: string
  saleConfigs: SaleConfig[]
}

interface UseSaleContractConfigReturn {
  data?: UseSaleContractConfigData
  isLoading: boolean
  isError: boolean
}

export const useSaleContractConfig = ({
  chainId,
  contractAddress,
  tokenIds
}: UseSaleContractConfigArgs): UseSaleContractConfigReturn => {
  const {
    data: paymentTokenERC1155,
    isLoading: isLoadingPaymentTokenERC1155,
    isError: isErrorPaymentTokenERC1155
  } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'paymentToken'
  })

  interface SaleDetailsERC1155 {
    cost: bigint
    startTime: bigint
    endTime: bigint
    supplyCap: bigint
    merkleRoot: string
  }

  const {
    data: globalSaleDetailsERC1155,
    isLoading: isLoadingGlobalSaleDetailsERC1155,
    isError: isErrorGlobalSaleDetailsERC1155
  } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'globalSaleDetails'
  })

  const baseTokenSaleContract = {
    chainId,
    abi: ERC_1155_SALE_CONTRACT as Abi,
    address: contractAddress as Hex,
    functionName: 'tokenSaleDetails'
  }

  const tokenSaleContracts = tokenIds.map(tokenId => ({
    ...baseTokenSaleContract,
    args: [BigInt(tokenId)]
  }))

  const {
    data: tokenSaleDetailsERC1155,
    isLoading: isLoadingTokenSaleDetailsERC1155,
    isError: isErrorTokenSaleDetailsERC1155
  } = useReadContracts({
    contracts: tokenSaleContracts
  })

  const isLoadingERC1155 = isLoadingPaymentTokenERC1155 || isLoadingGlobalSaleDetailsERC1155 || isLoadingTokenSaleDetailsERC1155
  const isErrorERC1155 = isErrorPaymentTokenERC1155 || isErrorGlobalSaleDetailsERC1155 || isErrorTokenSaleDetailsERC1155

  if (isLoadingERC1155 || isErrorERC1155) {
    return {
      data: undefined,
      isLoading: isLoadingERC1155,
      isError: isErrorERC1155
    }
  }

  const getSaleConfigs = (): SaleConfig[] => {
    let saleInfos: SaleConfig[] = []

    if (isLoadingERC1155 || isErrorERC1155) {
      return saleInfos
    }

    const { cost: globalCost } = globalSaleDetailsERC1155 as SaleDetailsERC1155

    saleInfos = tokenIds.map((tokenId, index) => {
      const tokenSaleDetails = tokenSaleDetailsERC1155?.[index].result as SaleDetailsERC1155
      const tokenPrice = tokenSaleDetails['cost'] || BigInt(0)
      const startTime = tokenSaleDetails['startTime'] || BigInt(0)
      const endTime = tokenSaleDetails['endTime'] || BigInt(0)

      // In the sale contract, the token sale has priority over the global sale
      // So we need to check if the token sale is set, and if it is, use that
      // Otherwise, we use the global sale

      const isTokenSaleInvalid =
        endTime === BigInt(0) ||
        BigInt(Math.floor(Date.now() / 1000)) <= startTime ||
        BigInt(Math.floor(Date.now() / 1000)) >= endTime

      const effectivePrice = isTokenSaleInvalid ? globalCost : tokenPrice

      return {
        tokenId,
        price: effectivePrice.toString()
      }
    })

    return saleInfos
  }

  return {
    data: {
      currencyAddress: paymentTokenERC1155 as string,
      saleConfigs: getSaleConfigs()
    },
    isLoading: isLoadingERC1155,
    isError: isErrorERC1155
  }
}

/**
 * @deprecated use useERC1155SaleContractPaymentModal instead
 */
export const useERC1155SaleContractPaymentModal = useERC1155SaleContractCheckout

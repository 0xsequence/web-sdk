import { ethers } from "ethers"
import { encodeFunctionData, toHex } from 'viem'

import { SelectPaymentSettings } from '../contexts'
import { useSelectPaymentContext } from '../contexts/SelectPaymentModal'

export const useSelectPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentContext()

  return { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings }
}

export interface SaleContractSettings {
  chain: number | string,
  price: string
  salesContractAddress: string
  recipientAddress: string
  tokenId: string,
  collectionAddress: string,
  nftQuantity: string,
  nftDecimals?: string,
  currencyAddress?: string
  disablePayWithCrypto?: boolean
  disablePayWithCreditCard?: boolean
  isDev?: boolean,
}

export const getSaleContractConfig = ({
  chain,
  price,
  salesContractAddress,
  recipientAddress,
  currencyAddress = ethers.ZeroAddress,
  disablePayWithCrypto = false,
  disablePayWithCreditCard = false,
  tokenId,
  collectionAddress,
  nftQuantity,
  nftDecimals = '0',
  isDev = false,
}: SaleContractSettings): SelectPaymentSettings => {
  const salesContractAbi = [
    {
      type: 'function',
      name: 'mint',
      inputs: [
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'tokenIds', type: 'uint256[]', internalType: 'uint256[]' },
        { name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' },
        { name: 'data', type: 'bytes', internalType: 'bytes' },
        { name: 'expectedPaymentToken', type: 'address', internalType: 'address' },
        { name: 'maxTotal', type: 'uint256', internalType: 'uint256' },
        { name: 'proof', type: 'bytes32[]', internalType: 'bytes32[]' }
      ],
      outputs: [],
      stateMutability: 'payable'
    },
  ]

  const purchaseTransactionData = encodeFunctionData({
    abi: salesContractAbi,
    functionName: 'mint',
    args: [recipientAddress, [BigInt(1)], [BigInt(1)], toHex(0), currencyAddress, price, [toHex(0, { size: 32 })]]
  })

  return ({
    ...(!disablePayWithCrypto ? {
      payWithCrypto: {
        chain,
        currencyAddress,
        price,
        targetContractAddress: salesContractAddress,
        txData: purchaseTransactionData,
        enableSwapPayments: true,
      } 
    } : {}),
    ...(!disablePayWithCreditCard ? {
      payWithCreditCard: {
        chain,
        currencyAddress,
        price,
        targetContractAddress: salesContractAddress,
        txData: purchaseTransactionData,
        tokenId,
        collectionAddress,
        nftQuantity,
        nftDecimals,
        isDev
      } 
    } : {})  
  })
}

export const useSaleContractPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const openSaleContractPaymentModal = (saleContractSettings: SaleContractSettings) => {
    openSelectPaymentModal(getSaleContractConfig(saleContractSettings))
  }

  return ({
    openSaleContractPaymentModal,
    closeSaleContractPaymentModal: closeSelectPaymentModal,
    selectPaymentSettings
  })
}
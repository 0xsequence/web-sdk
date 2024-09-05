import { ethers } from "ethers"
import { encodeFunctionData, toHex } from 'viem'

import { SelectPaymentSettings } from '../contexts'
import { useSelectPaymentContext } from '../contexts/SelectPaymentModal'

export const useSelectPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentContext()

  return { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings }
}

export interface SaleContractSettings {
  chainId: number
  priceRaw: string
  salesContractAddress: string
  recipientAddress: string
  nftId: string,
  nftAddress: string,
  nftQuantity: string,
  nftDecimals?: string,
  currencyAddress?: string
  disablePayWithCrypto?: boolean
  disablePayWithCreditCard?: boolean
  isDev?: boolean,
}

export const getSaleContractConfig = ({
  chainId,
  priceRaw,
  salesContractAddress,
  recipientAddress,
  currencyAddress = ethers.ZeroAddress,
  disablePayWithCrypto = false,
  disablePayWithCreditCard = false,
  nftId,
  nftAddress,
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
    args: [recipientAddress, [BigInt(1)], [BigInt(1)], toHex(0), currencyAddress, priceRaw, [toHex(0, { size: 32 })]]
  })

  return ({
    ...(!disablePayWithCrypto ? {
      payWithCrypto: {
        chainId,
        currencyAddress,
        currencyRawAmount: priceRaw,
        targetContractAddress: salesContractAddress,
        txData: purchaseTransactionData,
        enableSwapPayments: true,
      } 
    } : {}),
    ...(!disablePayWithCreditCard ? {
      payWithCreditCard: {
        chainId,
        currencyAddress,
        currencyRawAmount: priceRaw,
        targetContractAddress: salesContractAddress,
        txData: purchaseTransactionData,
        nftId,
        nftAddress,
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
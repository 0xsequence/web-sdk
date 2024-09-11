import { ethers } from "ethers"
import { encodeFunctionData, toHex } from 'viem'

import { SelectPaymentSettings } from '../contexts'
import { useSelectPaymentContext } from '../contexts/SelectPaymentModal'

export const useSelectPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentContext()

  return { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings }
}

export interface ERC1155SaleContractSettings {
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
  disableTransferFunds?: boolean
  disableFiatOnRamp?: boolean
  isDev?: boolean,
}

export const getERC1155SaleContractConfig = ({
  chain,
  price,
  salesContractAddress,
  recipientAddress,
  currencyAddress = ethers.ZeroAddress,
  disablePayWithCrypto = false,
  disablePayWithCreditCard = false,
  disableTransferFunds = false,
  disableFiatOnRamp = false,
  tokenId,
  collectionAddress,
  nftQuantity,
  nftDecimals = '0',
  isDev = false,
}: ERC1155SaleContractSettings): SelectPaymentSettings => {
  const erc1155SalesContractAbi = [
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
    abi: erc1155SalesContractAbi,
    functionName: 'mint',
    args: [recipientAddress, [BigInt(tokenId)], [BigInt(nftQuantity)], toHex(0), currencyAddress, price, [toHex(0, { size: 32 })]]
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
    } : {}),
    otherOptions: {
      enableFiatOnRamp: !disableFiatOnRamp,
      enableTransferFunds: !disableTransferFunds
    },
  })
}

export const useERC1155SaleContractPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const openERC1155SaleContractPaymentModal = (saleContractSettings: ERC1155SaleContractSettings) => {
    openSelectPaymentModal(getERC1155SaleContractConfig(saleContractSettings))
  }

  return ({
    openERC1155SaleContractPaymentModal,
    closeERC1155SaleContractPaymentModal: closeSelectPaymentModal,
    selectPaymentSettings
  })
}
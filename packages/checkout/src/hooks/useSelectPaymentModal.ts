import { ethers } from 'ethers'
import { encodeFunctionData, toHex } from 'viem'

import { SelectPaymentSettings } from '../contexts'
import { useSelectPaymentContext } from '../contexts/SelectPaymentModal'

export const useSelectPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentContext()

  return { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings }
}

type SaleContractSettings = Omit<SelectPaymentSettings, 'txData'>

export const getERC1155SaleContractConfig = ({
  chain,
  price,
  currencyAddress = ethers.ZeroAddress,
  recipientAddress,
  collectibles,
  collectionAddress,
  isDev = false,
  ...restProps
}: SaleContractSettings): SelectPaymentSettings => {
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
    }
  ]

  const purchaseTransactionData = encodeFunctionData({
    abi: erc1155SalesContractAbi,
    functionName: 'mint',
    args: [recipientAddress, collectibles.map(c => BigInt(c.tokenId)), collectibles.map(c => BigInt(c.quantity)), toHex(0), currencyAddress, price, [toHex(0, { size: 32 })]]
  })

  return {
    chain,
    price,
    currencyAddress,
    recipientAddress,
    collectibles,
    collectionAddress,
    isDev,
    txData: purchaseTransactionData,
    ...restProps
  }
}

export const useERC1155SaleContractPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const openERC1155SaleContractPaymentModal = (saleContractSettings: SaleContractSettings) => {
    openSelectPaymentModal(getERC1155SaleContractConfig(saleContractSettings))
  }

  return {
    openERC1155SaleContractPaymentModal,
    closeERC1155SaleContractPaymentModal: closeSelectPaymentModal,
    selectPaymentSettings
  }
}

// TODO: ERC721 utility
// export const getERC1155SaleContractConfig = ({
//   chain,
//   price,
//   currencyAddress = ethers.ZeroAddress,
//   recipientAddress,
//   collectibles,
//   collectionAddress,
//   isDev = false,
//   ...restProps
// }: SaleContractSettings): SelectPaymentSettings => {
//   const erc1155SalesContractAbi = [
//     {
//       type: 'function',
//       name: 'mint',
//       inputs: [
//         { name: 'to', type: 'address', internalType: 'address' },
//         { name: 'tokenIds', type: 'uint256[]', internalType: 'uint256[]' },
//         { name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' },
//         { name: 'data', type: 'bytes', internalType: 'bytes' },
//         { name: 'expectedPaymentToken', type: 'address', internalType: 'address' },
//         { name: 'maxTotal', type: 'uint256', internalType: 'uint256' },
//         { name: 'proof', type: 'bytes32[]', internalType: 'bytes32[]' }
//       ],
//       outputs: [],
//       stateMutability: 'payable'
//     }
//   ]

//   const purchaseTransactionData = encodeFunctionData({
//     abi: erc1155SalesContractAbi,
//     functionName: 'mint',
//     args: [recipientAddress, collectibles.map(c => BigInt(c.tokenId)), collectibles.map(c => BigInt(c.quantity)), toHex(0), currencyAddress, price, [toHex(0, { size: 32 })]]
//   })

//   return {
//     chain,
//     price,
//     currencyAddress,
//     recipientAddress,
//     collectibles,
//     collectionAddress,
//     isDev,
//     txData: purchaseTransactionData,
//     ...restProps
//   }
// }

export const useERC721SaleContractPaymentModal = () => {
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const openERC721SaleContractPaymentModal = (saleContractSettings: SaleContractSettings) => {
    openSelectPaymentModal(getERC721SaleContractConfig(saleContractSettings))
  }

  return {
    openERC721SaleContractPaymentModal,
    closeERC721SaleContractPaymentModal: closeSelectPaymentModal,
    selectPaymentSettings
  }
}
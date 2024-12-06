import { ethers } from 'ethers'
import { encodeFunctionData, toHex } from 'viem'

import { ERC_1155_SALE_CONTRACT, ERC_721_SALE_CONTRACT } from '../constants/abi'
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
  const purchaseTransactionData = encodeFunctionData({
    abi: ERC_1155_SALE_CONTRACT,
    functionName: 'mint',
    // [to, tokenIds, amounts, data, expectedPaymentToken, maxTotal, proof]
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

export const getERC721SaleContractConfig = ({
  chain,
  price,
  currencyAddress = ethers.ZeroAddress,
  recipientAddress,
  collectibles,
  collectionAddress,
  isDev = false,
  ...restProps
}: SaleContractSettings): SelectPaymentSettings => {
  const purchaseTransactionData = encodeFunctionData({
    abi: ERC_721_SALE_CONTRACT,
    functionName: 'mint',
    // [to, amount, paymentToken, maxTotal, proof]
    // args: [recipientAddress, collectibles.map(c => BigInt(c.quantity)), toHex(0), currencyAddress, price, [toHex(0, { size: 32 })]]
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
import { CheckoutOptionsSalesContractArgs } from '@0xsequence/marketplace'
import { findSupportedNetwork } from '@0xsequence/network'
import { TransactionSwapProvider, TransactionNFTCheckoutProvider } from '@0xsequence/marketplace'

import { useERC1155SaleContractPaymentModal } from './useSelectPaymentModal'
import { useCheckoutOptionsSalesContract } from "./useCheckoutOptionsSalesContract"
import { ERC_1155_SALE_CONTRACT } from '../constants/abi'
import { SelectPaymentSettings } from '../contexts/SelectPaymentModal'

import { Abi, Hex, padBytes } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

type BasePaymentModalSettings = Pick<SelectPaymentSettings, 'onSuccess' | 'onError' | 'copyrightText' | 'transactionConfirmations' | 'enableTransferFunds' | 'creditCardProviders' | 'enableMainCurrencyPayment' | 'enableSwapPayments' | 'isDev'>

interface UseERC1155SaleContractCheckoutArgs extends CheckoutOptionsSalesContractArgs {
  chain: number | string,
}

interface UseERC1155SaleContractCheckoutReturn {
  openCheckoutModal: () => void,
  isLoading: boolean,
  isError: boolean
}

export const useERC1155SaleContractCheckout = ({
  chain,
  contractAddress,
  wallet,
  collectionAddress,
  items,
  ...restArgs
}: UseERC1155SaleContractCheckoutArgs & BasePaymentModalSettings): UseERC1155SaleContractCheckoutReturn => {
  const { openERC1155SaleContractPaymentModal } = useERC1155SaleContractPaymentModal()
  const { data: checkoutOptions, isLoading: isLoadingCheckoutOptions, isError: isErrorCheckoutOptions } = useCheckoutOptionsSalesContract(chain, {
    contractAddress,
    wallet,
    collectionAddress,
    items
  }, {
    isDev: restArgs.isDev
  })
  const network = findSupportedNetwork(chain)
  const chainId = network?.chainId || 137

  const { data: saleConfigData, isLoading: isLoadingSaleConfig, isError: isErrorSaleConfig } = useSaleContractConfig({ chainId, contractAddress, tokenIds: items.map(i => i.tokenId) })

  const isLoading = isLoadingCheckoutOptions || isLoadingSaleConfig
  const error = isErrorCheckoutOptions || isErrorSaleConfig

  const openCheckoutModal = () => {
    if (isLoading || error) {
        console.error('Error loading checkout options or sale config', { isLoading, error })
      return
    }

    openERC1155SaleContractPaymentModal({
      collectibles: items.map(item => ({
        tokenId: item.tokenId,
        quantity: item.quantity
      })),
      chain: chainId,
      price: items.reduce((acc, item) => {
        const price = BigInt(saleConfigData?.saleConfigs.find(sale => sale.tokenId === item.tokenId)?.price || 0)
        console.log('price...', price)
        
        return acc + BigInt(item.quantity) * price
      }, BigInt(0)).toString(),
      currencyAddress: saleConfigData?.currencyAddress || '',
      recipientAddress: wallet,
      collectionAddress,
      targetContractAddress: contractAddress,
      enableMainCurrencyPayment: true,
      enableSwapPayments: checkoutOptions?.options?.swap?.includes(TransactionSwapProvider.zerox) || false,
      creditCardProviders: checkoutOptions?.options.nftCheckout || [],
      ...restArgs
    })
  }

  return ({
    openCheckoutModal,
    isLoading,
    isError: error
  })
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
  data?: UseSaleContractConfigData,
  isLoading: boolean,
  isError: boolean
}

export const useSaleContractConfig = ({ chainId, contractAddress, tokenIds, }: UseSaleContractConfigArgs): UseSaleContractConfigReturn => {
  const { data: paymentTokenERC1155, isLoading: isLoadingPaymentTokenERC1155, isError: isErrorPaymentTokenERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'paymentToken',
  })

  interface SaleDetailsERC1155 {
    cost: bigint,
    startTime: bigint,
    endTime: bigint,
    supplyCap: bigint,
    merkleRoot: string
  }

  const { data: globalSaleDetailsERC1155, isLoading: isLoadingGlobalSaleDetailsERC1155, isError: isErrorGlobalSaleDetailsERC1155 } = useReadContract({
    chainId,
    abi: ERC_1155_SALE_CONTRACT,
    address: contractAddress as Hex,
    functionName: 'globalSaleDetails',
  })

  const baseTokenSaleContract = {
    chainId,
    abi: ERC_1155_SALE_CONTRACT as Abi,
    address: contractAddress as Hex,
    functionName: 'tokenSaleDetails',
  }

  const tokenSaleContracts = tokenIds.map(tokenId => ({
    ...baseTokenSaleContract,
    args: [BigInt(tokenId)]
  }))

  const { data: tokenSaleDetailsERC1155, isLoading: isLoadingTokenSaleDetailsERC1155, isError: isErrorTokenSaleDetailsERC1155 } = useReadContracts({
    contracts: tokenSaleContracts,
  })

  const isLoadingERC1155 = isLoadingPaymentTokenERC1155 || isLoadingGlobalSaleDetailsERC1155 || isLoadingTokenSaleDetailsERC1155
  const isErrorERC1155 = isErrorPaymentTokenERC1155 || isErrorGlobalSaleDetailsERC1155 || isErrorTokenSaleDetailsERC1155

  if (isLoadingERC1155 || isErrorERC1155) {
    return ({
      data: undefined,
      isLoading: isLoadingERC1155,
      isError: isErrorERC1155
    })
  }

  const getSaleConfigs = (): SaleConfig[]  => {
    let saleInfos: SaleConfig[] = []

    if (isLoadingERC1155 || isErrorERC1155 ) return saleInfos
    
    // In the sale contract, the global sale has priority over the token sale
    // So we need to check if the global sale is set, and if it is, use that
    // Otherwise, we use the token sale
    const { cost: globalCost, startTime, endTime } = globalSaleDetailsERC1155 as SaleDetailsERC1155
    const isGlobalSaleInvalid = endTime === BigInt(0) || (BigInt(Math.floor(Date.now() / 1000)) <= startTime || BigInt(Math.floor(Date.now() / 1000)) >= endTime)
    saleInfos = tokenIds.map((tokenId, index) => {
      const tokenPrice = (tokenSaleDetailsERC1155?.[index].result as SaleDetailsERC1155)['cost'] || BigInt(0)
      return ({
        tokenId,
        price: (!isGlobalSaleInvalid ? globalCost : tokenPrice).toString()
      })
    })

    return saleInfos
  }  

  return ({
    data: {
      currencyAddress: paymentTokenERC1155 as string,
      saleConfigs: getSaleConfigs()
    },
    isLoading: isLoadingERC1155,
    isError: isErrorERC1155
  })
}
import { Text, Button, Spinner } from '@0xsequence/design-system'
import { useCheckoutUI } from '@0xsequence/checkout'
import { encodeFunctionData, toHex } from 'viem'
import { useAccount } from 'wagmi'
import { ERC_1155_SALE_CONTRACT } from '../constants/erc1155-sale-contract'

export const CustomCheckout = () => {
  const { address } = useAccount()

  // NATIVE token sale
  // const currencyAddress = zeroAddress
  // const salesContractAddress = '0xf0056139095224f4eec53c578ab4de1e227b9597'
  // const collectionAddress = '0x92473261f2c26f2264429c451f70b0192f858795'
  // const price = '200000000000000'
  // const contractId = '674eb55a3d739107bbd18ecb'

  // // ERC-20 contract
  const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
  const salesContractAddress = '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b'
  const collectionAddress = '0xdeb398f41ccd290ee5114df7e498cf04fac916cb'
  const price = '20000'
  const contractId = '674eb5613d739107bbd18ed2'

  const chainId = 137

  const collectible = {
    tokenId: '1',
    quantity: '1'
  }

  const purchaseTransactionData = encodeFunctionData({
    abi: ERC_1155_SALE_CONTRACT,
    functionName: 'mint',
    // [to, tokenIds, amounts, data, expectedPaymentToken, maxTotal, proof]
    args: [
      address,
      [BigInt(collectible.tokenId)],
      [BigInt(collectible.quantity)],
      toHex(0),
      currencyAddress,
      price,
      [toHex(0, { size: 32 })]
    ]
  })

  const checkoutUIParams = {}

  const { orderSummary, creditCardPayment, cryptoPayment } = useCheckoutUI({
    collectible,
    chain: chainId,
    totalPriceRaw: price,
    targetContractAddress: salesContractAddress,
    recipientAddress: address || '',
    currencyAddress,
    collectionAddress,
    creditCardProvider: 'sardine',
    transakConfig: {
      contractId,
      apiKey: '5911d9ec-46b5-48fa-a755-d59a715ff0cf'
    },
    onSuccess: (txnHash: string) => {
      console.log('success!', txnHash)
    },
    onError: (error: Error) => {
      console.error(error)
    },
    txData: purchaseTransactionData
  })

  console.log('orderSummary', orderSummary)
  console.log('creditCardPayment', creditCardPayment)
  console.log('cryptoPayment', cryptoPayment)

  return (
    <div className="flex pt-16 pb-8 px-6 gap-2 flex-col">
      <Text color="primary">Custom Checkout</Text>
    </div>
  )
}

export default CustomCheckout

import { type ForteConfig } from '@0xsequence/checkout'
import { zeroAddress } from 'viem'

import { ERC_1155_SALE_CONTRACT } from '../constants/erc1155-sale-contract'
import { ERC_721_SALE_CONTRACT } from '../constants/erc721-sale-contract'
import { encodeFunctionData, toHex } from 'viem'
import { orderbookAbi } from '../constants/orderbook-abi'

// Forte payment contract address (temporary will be replaced in new api inputs)
const FORTE_CONTRACT_ADDRESS = '0xa6abee70242d53841417586bb9d3fa31ef3cbae1'

interface PurchaseTransactionDataERC721Sale {
  recipientAddress: string
  currencyAddress: string
  price: string
}

const getPurchaseTransactionERC721Sale = ({ recipientAddress, currencyAddress, price }: PurchaseTransactionDataERC721Sale) => {
  return encodeFunctionData({
    abi: ERC_721_SALE_CONTRACT,
    functionName: 'mint',
    // [to, amount, expectedPaymentToken, maxTotal, proof]
    args: [recipientAddress, BigInt(1), currencyAddress, price, [toHex(0, { size: 32 })]]
  }) as `0x${string}`
}

interface PurchaseTransactionDataERC1155Sale {
  recipientAddress: string
  currencyAddress: string
  price: string
  collectibles: {
    tokenId: string
    quantity: string
  }[]
}

const getPurchaseTransactionERC1155Sale = ({
  recipientAddress,
  currencyAddress,
  price,
  collectibles
}: PurchaseTransactionDataERC1155Sale) => {
  return encodeFunctionData({
    abi: ERC_1155_SALE_CONTRACT,
    functionName: 'mint',
    // [to, tokenIds, amounts, data, expectedPaymentToken, maxTotal, proof]
    args: [
      recipientAddress,
      collectibles.map(c => BigInt(c.tokenId)),
      collectibles.map(c => BigInt(c.quantity)),
      toHex(0),
      currencyAddress,
      price,
      [toHex(0, { size: 32 })]
    ]
  }) as `0x${string}`
}

interface GetOrderbookTransactionDataArgs {
  recipientAddress: string
  requestId: string
  quantity: string
}

const getOrderbookTransactionData = ({ recipientAddress, requestId, quantity }: GetOrderbookTransactionDataArgs) => {
  return encodeFunctionData({
    abi: orderbookAbi,
    functionName: 'acceptRequest',
    args: [requestId, quantity, recipientAddress, [], []]
  }) as `0x${string}`
}

interface CheckoutPreset {
  chain: number | string
  currencyAddress: string
  targetContractAddress: string
  collectionAddress: string
  price: string
  collectibles: {
    tokenId?: string
    quantity: string
  }[]
  txData: `0x${string}`
  forteConfig?: ForteConfig
}

export const checkoutPresets: Record<string, (recipientAddress: string) => CheckoutPreset> = {
  'erc1155-sale-native-token-polygon': (recipientAddress: string) => {
    const collectibles = [
      {
        tokenId: '1',
        quantity: '1'
      }
    ]
    const price = '200000000000000'
    return {
      chain: 137,
      currencyAddress: zeroAddress,
      targetContractAddress: '0xf0056139095224f4eec53c578ab4de1e227b9597',
      collectionAddress: '0x92473261f2c26f2264429c451f70b0192f858795',
      price,
      collectibles,
      txData: getPurchaseTransactionERC1155Sale({
        recipientAddress,
        currencyAddress: zeroAddress,
        price,
        collectibles
      })
    }
  },
  'erc1155-sale-erc20-token-polygon': (recipientAddress: string) => {
    const collectibles = [
      {
        tokenId: '1',
        quantity: '1'
      }
    ]
    const price = '20000'
    return {
      chain: 137,
      currencyAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      targetContractAddress: '0xe65b75eb7c58ffc0bf0e671d64d0e1c6cd0d3e5b',
      collectionAddress: '0xdeb398f41ccd290ee5114df7e498cf04fac916cb',
      price,
      collectibles,
      txData: getPurchaseTransactionERC1155Sale({
        recipientAddress,
        currencyAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        price,
        collectibles
      })
    }
  },
  'erc721-sale-erc20-token-polygon': (recipientAddress: string) => {
    const collectibles = [
      {
        quantity: '1'
      }
    ]
    const price = '1'
    return {
      chain: 137,
      currencyAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      targetContractAddress: '0xa0284905d29cbeb19f4be486f9091fac215b7a6a',
      collectionAddress: '0xd705db0a96075b98758c4bdafe8161d8566a68f8',
      price,
      collectibles,
      txData: getPurchaseTransactionERC721Sale({
        recipientAddress,
        currencyAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        price
      })
    }
  },
  'forte-payment-testnet-testing-opensea': (recipientAddress: string) => {
    const collectibles = [
      {
        tokenId: '1',
        quantity: '1'
      }
    ]
    const price = '600000000000000'
    return {
      chain: 11155111,
      currencyAddress: zeroAddress,
      targetContractAddress: '0x1130e2e03f682f05f298fd702787d9bd0bf94316',
      collectionAddress: '0xb496d64e1fe4f3465fb83f3fd8cb50d8e227101b',
      price,
      collectibles,
      txData: getPurchaseTransactionERC1155Sale({
        recipientAddress,
        currencyAddress: zeroAddress,
        price,
        collectibles
      }),
      forteConfig: {
        protocol: 'seaport',
        orderHash: '0xa29984c1892bb28bc35170a0e7e4db64ceacfbd20dc5576bd67f1aae9dd678a3',
        // listings with amount > 1 are bugged
        // orderHash: '0x832b698e52508849fe533fdef53d6d9674be4f43eb1a2eb3415e46041f087af9',
        seaportProtocolAddress: '0x0000000000000068F116a894984e2DB1123eB395',
        sellerAddress: '0x184D4F89ad34bb0491563787ca28118273402986'
      }
    }
  },
  'forte-payment-erc1155-sale-native-token-testnet': (recipientAddress: string) => {
    const collectibles = [
      {
        tokenId: '1',
        quantity: '1'
      }
    ]
    const price = '10000000000000000'

    const structuredCalldata = {
      functionName: 'mint',
      arguments: [
        {
          type: 'address',
          value: '${receiver_address}'
        },
        {
          type: 'uint256[]',
          value: ['1']
        },
        {
          type: 'uint256[]',
          value: ['1']
        },
        {
          type: 'bytes',
          value: toHex(0)
        },
        {
          type: 'address',
          value: zeroAddress
        },
        {
          type: 'uint256',
          value: price
        },
        {
          type: 'bytes32[]',
          value: [toHex(0, { size: 32 })]
        }
      ]
    }

    return {
      chain: 11155111,
      currencyAddress: zeroAddress,
      targetContractAddress: '0x1130e2e03f682f05f298fd702787d9bd0bf94316',
      collectionAddress: '0xb496d64e1fe4f3465fb83f3fd8cb50d8e227101b',
      price,
      collectibles,
      txData: getPurchaseTransactionERC1155Sale({
        recipientAddress,
        currencyAddress: zeroAddress,
        price,
        collectibles
      }),
      forteConfig: {
        protocol: 'mint',
        calldata: structuredCalldata,
        sellerAddress: '0x184D4F89ad34bb0491563787ca28118273402986'
      }
    }
  },
  'forte-payment-custom-evm-call-testnet': (recipientAddress: string) => {
    const collectibles = [
      {
        tokenId: '1',
        quantity: '1'
      }
    ]
    const price = '10000000000000000'
    const txData = getOrderbookTransactionData({
      recipientAddress,
      requestId: '1',
      quantity: collectibles[0].quantity
    })
    return {
      chain: 11155111,
      currencyAddress: zeroAddress,
      targetContractAddress: '0x1130e2e03f682f05f298fd702787d9bd0bf94316',
      collectionAddress: '0xb496d64e1fe4f3465fb83f3fd8cb50d8e227101b',
      price,
      collectibles,
      txData,
      forteConfig: {
        protocol: 'custom_evm_call',
        calldata: txData,
        sellerAddress: '0x184D4F89ad34bb0491563787ca28118273402986'
      }
    }
  }
}

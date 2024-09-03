import { ethers } from "ethers"
import { encodeFunctionData, toHex } from 'viem'

import { SelectPaymentSettings } from '../contexts'

export const compareAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase()
}

export const truncateAtMiddle = (text: string, truncateAt: number) => {
  let finalText = text

  if (text.length >= truncateAt) {
    finalText = text.slice(0, truncateAt / 2) + '...' + text.slice(text.length - truncateAt / 2, text.length)
  }

  return finalText
}

export const formatAddress = (text: string) => {
  return `0x${truncateAtMiddle(text?.substring(2) || '', 8)}`
}

enum ValueType {
  VERY_LARGE,
  FRACTION,
  VERY_TINY,
  MIXED
}

export const formatDisplay = (_val: number | string): string => {
  if (isNaN(Number(_val))) {
    console.error(`display format error ${_val} is not a number`)
    return 'NaN'
  }

  const val = Number(_val)

  if (val === 0) {
    return '0'
  }

  let valMode: ValueType

  if (val > 100000000) {
    valMode = ValueType.VERY_LARGE
  } else if (val < 0.0000000001) {
    valMode = ValueType.VERY_TINY
  } else if (val < 1) {
    valMode = ValueType.FRACTION
  } else {
    valMode = ValueType.MIXED
  }

  let notation: Intl.NumberFormatOptions['notation'] = undefined
  let config: Pick<Intl.NumberFormatOptions, 'maximumFractionDigits' | 'maximumSignificantDigits'>

  switch (valMode) {
    case ValueType.VERY_LARGE:
      notation = 'compact'
      config = {
        maximumFractionDigits: 4
      }
      break
    case ValueType.VERY_TINY:
      notation = 'scientific'
      config = {
        maximumFractionDigits: 4
      }
      break
    case ValueType.FRACTION:
      notation = 'standard'
      config = {
        maximumSignificantDigits: 4
      }
      break
    default:
      notation = 'standard'
      config = {
        maximumFractionDigits: 2
      }
  }

  return Intl.NumberFormat('en-US', {
    notation,
    ...config
  }).format(val)
}

export const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

interface GetSalesContractConfigArgs {
  chainId: number
  priceRaw: string
  salesContractAddress: string
  recipientAddress: string
  currencyAddress?: string
  disablePayWithCrypto?: boolean
  disablePayWithCreditCard?: boolean
}

export const getSalesContractConfig = ({
  chainId,
  priceRaw,
  salesContractAddress,
  recipientAddress,
  currencyAddress = ethers.ZeroAddress,
  disablePayWithCrypto = false,
  disablePayWithCreditCard = false,
}: GetSalesContractConfigArgs): SelectPaymentSettings => {
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
      } 
    } : {})  
  })
}
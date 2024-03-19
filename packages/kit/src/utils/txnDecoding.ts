import { ContractCall } from '@0xsequence/api'
import { commons } from '@0xsequence/core'
import { ContractType, TxnTransferType } from '@0xsequence/indexer'
import { BigNumber, BigNumberish, BytesLike, ethers } from 'ethers'
import { getNetworkConfigAndClients } from './clients'
import { getAddress } from 'ethers/lib/utils'

interface TransactionEncodedWithCall extends commons.transaction.TransactionEncoded {
  call?: ContractCall
}

type Args = Record<string, any>

interface TxnData {
  to: string
  signature: string
  byteSignature: string
  methodName: string
  args: Args
  objs: TxnData[]
  value: string
  data: string
}

export enum DecodingType {
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  SWAP = 'swap',
  AWARD_ITEM = 'awardItem',
  UNIMPLEMENTED = 'unimplemented',
  UNKNOWN = 'unknown'
}

export interface BaseDecoding {
  type: DecodingType
  signature: string
  byteSignature: string
  methodName: string
  target: string
  value: string
}

export interface TransferProps extends BaseDecoding {
  type: DecodingType.TRANSFER
  transferType: TxnTransferType
  contractAddress: string
  contractType: ContractType
  from: string
  to: string
  tokenIds?: string[]
  amounts: string[]
  isNetworkFee?: boolean
}

export interface AwardItemProps extends BaseDecoding {
  type: DecodingType.AWARD_ITEM
  contractAddress: string
  to: string
  amount: string
}

export interface UnknownProps extends BaseDecoding {
  type: DecodingType.UNKNOWN
}

export type TxnProps = TransferProps | AwardItemProps

interface ContractCallArg {
  name?: string
  type: string
  value: any
}

// Transform decoded contract call arguments to a object format
const transformArgs = (args: ContractCallArg[]): any => {
  return Object.fromEntries(
    args.map((arg, i) => [
      arg.name && !arg.name.startsWith('unnamed') ? arg.name : `_${i}`,
      Array.isArray(arg.value)
        ? arg.type.startsWith('(') && (arg.type.endsWith(')') || arg.type.endsWith(')[]'))
          ? transformArgs(arg.value)
          : arg.value
        : arg.value
    ])
  )
}

const createTxnData = (to: string, call: ContractCall, value: BigNumberish, data: BytesLike): TxnData => {
  const args = transformArgs(call.args)
  const byteSignature = ethers.utils.hexDataSlice(data, 0, 4)

  let objs: TxnData['objs'] = []
  switch (call.signature) {
    case 'execute((bool,bool,uint256,address,uint256,bytes)[],uint256,bytes)':
    case 'selfExecute((bool,bool,uint256,address,uint256,bytes)[])': {
      const txns: TransactionEncodedWithCall[] = call.args[0].value
      objs = txns.map(txn =>
        txn.call
          ? createTxnData(txn.target, txn.call, txn.value, txn.data)
          : {
              to: txn.target,
              signature: '',
              byteSignature: ethers.utils.hexDataSlice(txn.data, 0, 4),
              methodName: '',
              args: {},
              objs: [],
              value: BigNumber.from(txn.value).toString(),
              data: ethers.utils.hexlify(txn.data)
            }
      )
    }
  }

  return {
    to,
    signature: call.signature,
    byteSignature,
    methodName: call.function,
    args,
    objs,
    value: BigNumber.from(value).toString(),
    data: ethers.utils.hexlify(data)
  }
}

export const encodeTransactions = (
  transactions: Array<commons.transaction.Transaction | commons.transaction.TransactionEncoded>
): commons.transaction.TransactionEncoded[] => {
  return transactions
    .map(transaction => {
      if ('target' in transaction) {
        return transaction
      } else {
        return { ...transaction, target: transaction.to }
      }
    })
    .map(transaction => ({
      delegateCall: transaction.delegateCall ?? false,
      revertOnError: transaction.revertOnError ?? false,
      gasLimit: transaction.gasLimit ?? 0,
      target: transaction.target ?? '0x0000000000000000000000000000000000000000',
      value: transaction.value ?? 0,
      data: transaction.data ?? '0x'
    }))
}

export enum ByteSignature {
  SEQUENCE_DEPLOY = '0x32c02a14',
  SEQUENCE_PUBLISH_CONFIG = '0x44d466c2',
  SEQUENCE_UPDATE_IMAGE_HASH = '0x29561426',
  SEQUENCE_UPDATE_IMPLEMENTATION = '0x025b22bc',
  SEQUENCE_REQUIRE_SESSION_NONCE = '0x8853baa0',

  EXECUTE = '0x7a9a1628',
  SELF_EXECUTE = '0x61c2926c',

  APPROVE = '0x095ea7b3',
  TRANSFER = '0xa9059cbb',
  DEPOSIT = '0xd0e30db0',
  WITHDRAW = '0x2e1a7d4d',

  ERC721_SAFE_TRANSFER_FROM = '0x42842e0e',
  ERC721_SAFE_TRANSFER_FROM_WITH_DATA = '0xb88d4fde',
  ERC1155_SAFE_TRANSFER_FROM = '0xf242432a',
  ERC1155_SAFE_BATCH_TRANSFER_FROM = '0x2eb2c2d6',

  NIFTYSWAP_BUY_TOKENS = '0xd93e8aaa',

  TRANSFORM_ERC20 = '0x415565b0',
  OUTBOUND_TRANSFER_TO = '0xa44bbb15',
  CELER_SEND = '0xa5977fbb',

  UNISWAPV3_MULTICALL = '0x5ae401dc',

  UNISWAPV2_SWAP_EXACT_TOKENS_FOR_TOKENS = '0x38ed1739',
  UNISWAPV2_SWAP_TOKENS_FOR_EXACT_TOKENS = '0x8803dbee',
  UNISWAPV2_SWAP_EXACT_ETH_FOR_TOKENS = '0x7ff36ab5',
  UNISWAPV2_SWAP_ETH_FOR_EXACT_TOKENS = '0xfb3bdb41',
  UNISWAPV2_SWAP_TOKENS_FOR_EXACT_ETH = '0x4a25d94a',
  UNISWAPV2_SWAP_EXACT_TOKENS_FOR_ETH = '0x18cbafe5',

  // For demo NFT contract
  AWARD_ITEM = '0xcf378343'
}

interface CreateTypedTxnData<S extends ByteSignature, A extends Args> extends TxnData {
  byteSignature: S
  args: A
  signature: string
  methodName: string
}
// safeBatchTransferFrom(address _from, address _to, uint256[] _ids, uint256[] _amounts, bytes _data)
export interface SafeBatchTransferFromArgs {
  _from: string
  _to: string
  _ids: string[]
  _amounts: string[]
  _data: string
}
// safeTransferFrom(address from, address to, uint256 tokenId)
// safeTransferFrom(address from, address to, uint256 tokenId, bytes data)
export interface ERC721SafeTransferFromArgs {
  from: string
  to: string
  tokenId: string
  data?: string
}
// safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes _data)
export interface ERC1155SafeTransferFromArgs {
  _from: string
  _to: string
  _id: string
  _amount: string
  _data: string
}

// transfer(address recipient, uint256 amount)
export interface TransferArgs {
  recipient: string
  amount: number
}

interface AwardItemArgs {
  player: string
  tokenURI: string
}

type TransferTxnData = CreateTypedTxnData<ByteSignature.TRANSFER, TransferArgs>
type SafeBatchTransferFromTxnData = CreateTypedTxnData<ByteSignature.ERC1155_SAFE_BATCH_TRANSFER_FROM, SafeBatchTransferFromArgs>
type ERC721SafeTransferFromTxnData = CreateTypedTxnData<
  ByteSignature.ERC721_SAFE_TRANSFER_FROM | ByteSignature.ERC721_SAFE_TRANSFER_FROM_WITH_DATA,
  ERC721SafeTransferFromArgs
>
type ERC1155SafeTransferFromTxnData = CreateTypedTxnData<ByteSignature.ERC1155_SAFE_TRANSFER_FROM, ERC1155SafeTransferFromArgs>

type AwardItemTxnData = CreateTypedTxnData<ByteSignature.AWARD_ITEM, AwardItemArgs>

type DecodedTxnData =
  | TransferTxnData
  | SafeBatchTransferFromTxnData
  | ERC721SafeTransferFromTxnData
  | ERC1155SafeTransferFromTxnData
  | AwardItemTxnData

const decodeTxnData = async (txns: commons.transaction.TransactionEncoded[]): Promise<TxnData> => {
  const mainModule = new ethers.utils.Interface(mainModuleAbi)
  const callData = mainModule.encodeFunctionData('selfExecute', [txns])

  try {
    const { apiClient } = getNetworkConfigAndClients(1) // chainId passed here doesn't matter since we get apiClient
    const { call } = await apiClient.decodeContractCall({ callData })

    return createTxnData('', call, 0, callData)
  } catch (err) {
    throw new Error(err)
  }
}

export const decodeTransactions = async (
  accountAddress: string,
  txns: commons.transaction.Transaction[]
): Promise<TxnProps[]> => {
  const encodedTxns = encodeTransactions(txns)
  const decodedTxnDatas = (await decodeTxnData(encodedTxns)).objs as DecodedTxnData[]

  const from = getAddress(accountAddress)

  const txnProps = encodedTxns.map((txn, i): TxnProps | undefined => {
    const decodedTxnData = decodedTxnDatas[i] as DecodedTxnData
    const data = txn.data.toString()
    const value = BigNumber.from(txn.value).toString()
    const target = txn.target

    if (data === '0x' || !data) {
      // this is a native token transfer
      return {
        signature: '',
        byteSignature: '',
        type: DecodingType.TRANSFER,
        methodName: 'nativeTokenTransfer',
        transferType: TxnTransferType.SEND,
        contractAddress: ethers.constants.AddressZero,
        contractType: ContractType.UNKNOWN,
        from,
        to: getAddress(txn.target),
        tokenIds: ['0'],
        amounts: [value],
        target,
        value
      }
    }

    if (!decodedTxnData) {
      return undefined
    }

    const contractAddress = getAddress(txn.target)

    const baseDecoding: BaseDecoding = {
      type: DecodingType.UNIMPLEMENTED,
      signature: decodedTxnData.signature,
      byteSignature: decodedTxnData.byteSignature,
      methodName: decodedTxnData.methodName,
      target,
      value
    }

    switch (decodedTxnData.byteSignature) {
      case ByteSignature.TRANSFER: {
        const { args } = decodedTxnData

        return {
          ...baseDecoding,
          type: DecodingType.TRANSFER,
          transferType: TxnTransferType.SEND,
          contractAddress,
          contractType: ContractType.ERC20,
          from,
          to: getAddress(args.recipient),
          tokenIds: ['0'],
          amounts: [String(args.amount)]
        }
      }
      case ByteSignature.ERC721_SAFE_TRANSFER_FROM:
      case ByteSignature.ERC721_SAFE_TRANSFER_FROM_WITH_DATA: {
        const args = decodedTxnData.args

        return {
          ...baseDecoding,
          type: DecodingType.TRANSFER,
          transferType: TxnTransferType.SEND,
          contractAddress,
          contractType: ContractType.ERC721,
          from,
          to: getAddress(args.to),
          tokenIds: [args.tokenId],
          amounts: ['1']
        }
      }

      case ByteSignature.ERC1155_SAFE_TRANSFER_FROM: {
        const args = decodedTxnData.args

        return {
          ...baseDecoding,
          type: DecodingType.TRANSFER,
          transferType: TxnTransferType.SEND,
          contractAddress,
          contractType: ContractType.ERC1155,
          from,
          to: getAddress(args._to),
          tokenIds: [args._id],
          amounts: [args._amount]
        }
      }

      case ByteSignature.ERC1155_SAFE_BATCH_TRANSFER_FROM: {
        const { args } = decodedTxnData

        return {
          ...baseDecoding,
          type: DecodingType.TRANSFER,
          transferType: TxnTransferType.SEND,
          contractAddress,
          contractType: ContractType.ERC1155,
          from,
          to: getAddress(args._to),
          tokenIds: args._ids,
          amounts: args._amounts
        }
      }

      case ByteSignature.AWARD_ITEM: {
        const { args } = decodedTxnData

        return {
          ...baseDecoding,
          type: DecodingType.AWARD_ITEM,
          contractAddress,
          // @ts-ignore-next-line
          to: getAddress(args._0),
          amount: '1'
        }
      }
    }

    return undefined
  })

  return txnProps.flatMap(txn => {
    if (txn) {
      return [txn]
    }
    return []
  })
}

const mainModuleAbi = [
  {
    type: 'function',
    name: 'nonce',
    constant: true,
    inputs: [],
    outputs: [
      {
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'readNonce',
    constant: true,
    inputs: [
      {
        type: 'uint256'
      }
    ],
    outputs: [
      {
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'updateImplementation',
    constant: false,
    inputs: [
      {
        type: 'address'
      }
    ],
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'selfExecute',
    constant: false,
    inputs: [
      {
        components: [
          {
            type: 'bool',
            name: 'delegateCall'
          },
          {
            type: 'bool',
            name: 'revertOnError'
          },
          {
            type: 'uint256',
            name: 'gasLimit'
          },
          {
            type: 'address',
            name: 'target'
          },
          {
            type: 'uint256',
            name: 'value'
          },
          {
            type: 'bytes',
            name: 'data'
          }
        ],
        type: 'tuple[]'
      }
    ],
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'execute',
    constant: false,
    inputs: [
      {
        components: [
          {
            type: 'bool',
            name: 'delegateCall'
          },
          {
            type: 'bool',
            name: 'revertOnError'
          },
          {
            type: 'uint256',
            name: 'gasLimit'
          },
          {
            type: 'address',
            name: 'target'
          },
          {
            type: 'uint256',
            name: 'value'
          },
          {
            type: 'bytes',
            name: 'data'
          }
        ],
        type: 'tuple[]'
      },
      {
        type: 'uint256'
      },
      {
        type: 'bytes'
      }
    ],
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'createContract',
    inputs: [
      {
        type: 'bytes'
      }
    ],
    payable: true,
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'setExtraImageHash',
    constant: false,
    inputs: [
      {
        type: 'bytes32',
        name: 'imageHash'
      },
      {
        type: 'uint256',
        name: 'expiration'
      }
    ],
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable'
  }
]

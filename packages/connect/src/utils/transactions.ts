import { sequence } from '0xsequence'
import { SequenceIndexer, TransactionStatus, type TransactionReceipt } from '@0xsequence/indexer'
import { SequenceWaaS, type FeeOption } from '@0xsequence/waas'
import type { Hex, PublicClient, WalletClient } from 'viem'
import type { Connector } from 'wagmi'

import { TRANSACTION_CONFIRMATIONS_DEFAULT } from '../constants/index.js'
import type { ExtendedConnector } from '../types.js'
import { compareAddress } from '../utils/helpers.js'

class FeeOptionInsufficientFundsError extends Error {
  public readonly feeOptions: FeeOption[]

  constructor(message: string, feeOptions: FeeOption[]) {
    super(message)
    this.name = 'FeeOptionInsufficientFundsError'
    this.feeOptions = feeOptions
  }
}

interface Transaction {
  to: Hex
  data?: Hex
  value?: bigint
}

interface SendTransactionsInput {
  chainId: number
  senderAddress: Hex
  publicClient: PublicClient
  walletClient: WalletClient
  connector: Connector
  transactions: Transaction[]
  indexerClient: SequenceIndexer
  transactionConfirmations?: number
  waitConfirmationForLastTransaction?: boolean
}

export const sendTransactions = async ({
  chainId,
  senderAddress,
  publicClient,
  walletClient,
  connector,
  transactions,
  indexerClient,
  transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT,
  waitConfirmationForLastTransaction = true
}: SendTransactionsInput): Promise<string> => {
  const walletClientChainId = await walletClient.getChainId()

  if (walletClientChainId !== chainId) {
    throw new Error('The Wallet Client is using the wrong network')
  }

  if (publicClient.chain?.id !== chainId) {
    throw new Error('The Public Client is using the wrong network')
  }

  const sequenceWaaS = (connector as any)?.['sequenceWaas'] as SequenceWaaS | undefined
  const isEmbeddedWallet = !!sequenceWaaS
  const isSequenceUniversalWallet = !!(connector as ExtendedConnector)?._wallet?.isSequenceBased

  // Sequence WaaS
  if (isEmbeddedWallet) {
    // waas connector logic
    const resp = await sequenceWaaS.feeOptions({
      transactions: transactions,
      network: chainId
    })

    const isSponsored = resp.data.feeOptions.length == 0

    let transactionsFeeOption
    const transactionsFeeQuote = resp.data.feeQuote

    const balances = await indexerClient.getTokenBalancesDetails({
      filter: {
        accountAddresses: [senderAddress],
        omitNativeBalances: false
      }
    })

    for (const feeOption of resp.data.feeOptions) {
      const isNativeToken = feeOption.token.contractAddress == null

      if (isNativeToken) {
        const nativeTokenBalance = balances.nativeBalances?.[0].balance || '0'
        if (BigInt(nativeTokenBalance) >= BigInt(feeOption.value)) {
          transactionsFeeOption = feeOption
          break
        }
      } else {
        const erc20TokenBalance = balances.balances.find(b =>
          compareAddress(b.contractAddress, feeOption.token.contractAddress || '')
        )
        const erc20TokenBalanceValue = erc20TokenBalance?.balance || '0'
        if (BigInt(erc20TokenBalanceValue) >= BigInt(feeOption.value)) {
          transactionsFeeOption = feeOption
          break
        }
      }
    }

    if (!transactionsFeeOption && !isSponsored) {
      throw new FeeOptionInsufficientFundsError(
        `Transaction fee option with valid user balance not found: ${resp.data.feeOptions.map(f => f.token.symbol).join(', ')}`,
        resp.data.feeOptions
      )
    }

    const response = await sequenceWaaS.sendTransaction({
      transactions,
      transactionsFeeOption,
      transactionsFeeQuote,
      network: chainId
    })

    if (response.code === 'transactionFailed') {
      throw new Error(response.data.error)
    }

    const txnHash = response.data.txHash

    if (waitConfirmationForLastTransaction) {
      const { txnStatus } = await waitForTransactionReceipt({
        indexerClient,
        txnHash: txnHash as Hex,
        publicClient,
        confirmations: transactionConfirmations
      })

      if (txnStatus === TransactionStatus.FAILED) {
        throw new Error('Transaction failed')
      }
    }

    return txnHash

    // Sequence-Based Connector
  } else if (isSequenceUniversalWallet) {
    const wallet = sequence.getWallet()
    const signer = wallet.getSigner()
    const response = await signer.sendTransaction(transactions)

    if (waitConfirmationForLastTransaction) {
      const { txnStatus } = await waitForTransactionReceipt({
        indexerClient,
        txnHash: response.hash as Hex,
        publicClient,
        confirmations: transactionConfirmations
      })

      if (txnStatus === TransactionStatus.FAILED) {
        throw new Error('Transaction failed')
      }
    }

    return response.hash
    // Other connectors (metamask, eip-6963, etc...)
  } else {
    let txHash: string = ''
    // We fire the transactions one at a time since the cannot be batched
    for (const [index, transaction] of transactions.entries()) {
      const txnHash = await walletClient.sendTransaction({
        account: senderAddress,
        to: transaction.to,
        value: transaction?.value,
        data: transaction?.data,
        chain: undefined
      })

      const isLastTransaction = index === transactions.length - 1

      if (!isLastTransaction || (isLastTransaction && waitConfirmationForLastTransaction)) {
        const { txnStatus } = await waitForTransactionReceipt({
          indexerClient,
          txnHash,
          publicClient,
          confirmations: transactionConfirmations
        })

        if (txnStatus === TransactionStatus.FAILED) {
          throw new Error('Transaction failed')
        }
      }

      // The transaction hash of the last transaction is the one that should be returned
      txHash = txnHash
    }

    return txHash
  }
}

interface WaitForTransactionReceiptInput {
  indexerClient: SequenceIndexer
  txnHash: Hex
  publicClient: PublicClient
  confirmations?: number
}

export const waitForTransactionReceipt = async ({
  indexerClient,
  txnHash,
  publicClient,
  confirmations
}: WaitForTransactionReceiptInput): Promise<TransactionReceipt> => {
  const { receipt } = await indexerClient.fetchTransactionReceipt({
    txnHash
  })

  if (confirmations) {
    const blockConfirmationPromise = new Promise<void>(resolve => {
      const unwatch = publicClient.watchBlocks({
        onBlock: ({ number: currentBlockNumber }) => {
          const confirmedBlocknumber = receipt.blockNumber + confirmations
          if (currentBlockNumber >= confirmedBlocknumber) {
            unwatch()
            resolve()
          }
        }
      })
    })

    await blockConfirmationPromise
  }

  return receipt
}

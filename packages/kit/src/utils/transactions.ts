import { sequence } from '0xsequence'
import { SequenceWaaS } from '@0xsequence/waas'
import { PublicClient, WalletClient, Hex } from 'viem'
import { Connector } from 'wagmi'

import { TRANSACTION_CONFIRMATIONS_DEFAULT } from '../constants'
import { ExtendedConnector } from '../types'

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
  transactionConfirmations?: number
}

export const sendTransactions = async ({
  chainId,
  senderAddress,
  publicClient,
  walletClient,
  connector,
  transactions,
  transactionConfirmations = TRANSACTION_CONFIRMATIONS_DEFAULT
}: SendTransactionsInput): Promise<string> => {
  const walletClientChainId = await walletClient.getChainId()
  if (walletClientChainId !== chainId) {
    await walletClient.switchChain({ id: chainId })
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

    const transactionsFeeOption = resp.data.feeOptions[0]
    const transactionsFeeQuote = resp.data.feeQuote

    const response = await sequenceWaaS.sendTransaction({
      transactions,
      transactionsFeeOption,
      transactionsFeeQuote
    })

    if (response.code === 'transactionFailed') {
      throw new Error(response.data.error)
    }

    const txnHash = response.data.txHash

    await publicClient.waitForTransactionReceipt({
      hash: txnHash as Hex,
      confirmations: transactionConfirmations
    })

    return txnHash

    // Sequence-Based Connector
  } else if (isSequenceUniversalWallet) {
    const wallet = sequence.getWallet()
    const signer = wallet.getSigner()
    const response = await signer.sendTransaction(transactions)
    await publicClient.waitForTransactionReceipt({
      hash: response.hash as Hex,
      confirmations: transactionConfirmations
    })

    return response.hash
    // Other connectors (metamask, eip-6963, etc...)
  } else {
    let txHash: string = ''
    // We fire the transactions one at a time since the cannot be batched
    for (const transaction of transactions) {
      const txnHash = await walletClient.sendTransaction({
        account: senderAddress,
        to: transaction.to,
        value: transaction?.value,
        data: transaction?.data,
        chain: undefined
      })

      await publicClient.waitForTransactionReceipt({
        hash: txnHash as Hex,
        confirmations: transactionConfirmations
      })

      // The transaction hash of the last transaction is the one that should be returned
      txHash = txnHash
    }

    return txHash
  }
}

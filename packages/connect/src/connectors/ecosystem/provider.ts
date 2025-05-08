import { allNetworks, type EIP1193Provider } from '@0xsequence/network'
import { ethers } from 'ethers'
import { getAddress, TransactionRejectedRpcError } from 'viem'

import { normalizeChainId } from '../../utils/helpers'

import { ProviderTransport } from './providerTransport'

export class EcosystemWalletTransportProvider extends ethers.AbstractProvider implements EIP1193Provider {
  jsonRpcProvider: ethers.JsonRpcProvider
  currentNetwork: ethers.Network
  transport: ProviderTransport

  constructor(
    public projectAccessKey: string,
    public walletUrl: string,
    public initialChainId: number,
    public nodesUrl: string
  ) {
    super(initialChainId)

    const initialChainName = allNetworks.find(n => n.chainId === initialChainId)?.name
    const initialJsonRpcProvider = new ethers.JsonRpcProvider(`${nodesUrl}/${initialChainName}/${projectAccessKey}`)

    this.transport = new ProviderTransport(walletUrl)
    this.jsonRpcProvider = initialJsonRpcProvider
    this.currentNetwork = ethers.Network.from(initialChainId)
  }

  async request({ method, params }: { method: string; params?: any[] }) {
    if (method === 'wallet_switchEthereumChain') {
      const chainId = normalizeChainId(params?.[0].chainId)

      const networkName = allNetworks.find(n => n.chainId === chainId)?.name
      const jsonRpcProvider = new ethers.JsonRpcProvider(`${this.nodesUrl}/${networkName}/${this.projectAccessKey}`)

      this.jsonRpcProvider = jsonRpcProvider
      this.currentNetwork = ethers.Network.from(chainId)

      return null
    }

    if (method === 'eth_chainId') {
      return ethers.toQuantity(this.currentNetwork.chainId)
    }

    if (method === 'eth_accounts') {
      const address = this.transport.getWalletAddress()
      if (!address) {
        return []
      }
      const account = getAddress(address)
      return [account]
    }

    if (method === 'eth_sendTransaction') {
      if (!params) {
        throw new Error('No params')
      }

      try {
        const response = await this.transport.sendRequest(method, params, this.getChainId())

        if (response.walletAddress && response.walletAddress !== this.transport.getWalletAddress()) {
          this.transport.disconnect()
          throw new TransactionRejectedRpcError(new Error('Wallet address mismatch, please reconnect.'))
        }

        if (response.code === 'transactionFailed') {
          throw new TransactionRejectedRpcError(new Error(`Unable to send transaction: ${response.data.error}`))
        }

        if (response.code === 'transactionReceipt') {
          const { txHash } = response.data
          return txHash
        }
      } catch (e) {
        console.log('error in sendTransaction', e)
        throw new TransactionRejectedRpcError(new Error(`Unable to send transaction: ${e}`))
      }
    }

    if (
      method === 'eth_sign' ||
      method === 'eth_signTypedData' ||
      method === 'eth_signTypedData_v4' ||
      method === 'personal_sign'
    ) {
      if (!params) {
        throw new Error('No params')
      }
      try {
        const response = await this.transport.sendRequest(method, params, this.getChainId())

        if (response.walletAddress && response.walletAddress !== this.transport.getWalletAddress()) {
          this.transport.disconnect()
          throw new TransactionRejectedRpcError(new Error('Wallet address mismatch, please reconnect.'))
        }

        return response.data.signature
      } catch (e) {
        console.log('error in sign', e)
        throw new TransactionRejectedRpcError(new Error(`Unable to sign: ${e}`))
      }
    }

    return await this.jsonRpcProvider.send(method, params ?? [])
  }

  async getTransaction(txHash: string) {
    return await this.jsonRpcProvider.getTransaction(txHash)
  }

  detectNetwork(): Promise<ethers.Network> {
    return Promise.resolve(this.currentNetwork)
  }

  getChainId() {
    return Number(this.currentNetwork.chainId)
  }
}

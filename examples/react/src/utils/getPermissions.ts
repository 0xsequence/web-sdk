import { Extensions, SessionConfig, Signers, Wallet } from '@0xsequence/dapp-client'
import { allNetworks } from '@0xsequence/network'
import { Provider, RpcTransport } from 'ox'
import { Address } from 'viem'

const NODES_URL = 'https://nodes.sequence.app/{network}'

function applyTemplate(template: string, values: Record<string, string>) {
  return template.replace(/{(.*?)}/g, (_, key) => {
    const value = values[key]
    if (value === undefined) {
      throw new Error(`Missing template value for ${template}: ${key}`)
    }
    return value
  })
}

export const getNetwork = (chainId: number) => {
  const network = allNetworks.find(network => network.chainId === chainId)

  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`)
  }

  return network
}

export const getSequenceRpcUrl = (chainId: number) => {
  const network = getNetwork(chainId)

  const url = applyTemplate(NODES_URL, { network: network.name })

  return url
}

export const getPermissions = async (walletAddress: Address, sessionAddress: Address, chainId: number) => {
  const wallet = new Wallet(walletAddress)
  const rpcUrl = getSequenceRpcUrl(chainId)
  const provider = Provider.from(RpcTransport.fromHttp(rpcUrl))
  const tempManager = new Signers.SessionManager(wallet, {
    sessionManagerAddress: Extensions.Dev1.sessions,
    provider: provider
  })
  const topology = await tempManager.getTopology()
  const permissions = SessionConfig.getSessionPermissions(topology, sessionAddress)
  return permissions
}

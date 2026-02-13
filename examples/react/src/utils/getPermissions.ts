import { allNetworks } from '@0xsequence/network'

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

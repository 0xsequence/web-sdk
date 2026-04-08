import { http, type Chain } from 'viem'

import { normalizeSequenceNodesUrl } from '../utils/helpers.js'
import { getNetwork } from '../utils/networks.js'

const isSequenceNodeUrl = (url: string): boolean => {
  return url.includes('sequence.app')
}

const applyTemplate = (template: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template)
}

const resolveNetworkName = (chain: Chain, nodesUrl: string): string => {
  if (isSequenceNodeUrl(nodesUrl)) {
    try {
      return getNetwork(chain.id).name
    } catch {
      return (chain as any).shortName ?? chain.name
    }
  }

  return (chain as any).shortName ?? chain.name
}

const withSequenceNetworkPath = (url: string, networkName: string, hasTemplate: boolean): string => {
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url

  if (hasTemplate) {
    return cleanUrl
  }

  return `${cleanUrl}/${networkName}`
}

const appendAccessKey = (url: string, accessKey: string): string => {
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
  if (cleanUrl.endsWith(accessKey)) {
    return cleanUrl
  }

  return `${cleanUrl}/${accessKey}`
}

export const getDefaultTransports = (chains: readonly [Chain, ...Chain[]], projectAccessKey?: string, nodesUrl?: string) => {
  return Object.fromEntries(
    chains.map(chain => {
      const resolvedNodesUrl = nodesUrl
        ? (() => {
            const normalizedNodesUrl = normalizeSequenceNodesUrl(nodesUrl) ?? nodesUrl
            const networkName = resolveNetworkName(chain, normalizedNodesUrl)
            const hasTemplate = normalizedNodesUrl.includes('{network}')
            const templatedUrl = applyTemplate(normalizedNodesUrl, { network: networkName })

            return isSequenceNodeUrl(normalizedNodesUrl)
              ? withSequenceNetworkPath(templatedUrl, networkName, hasTemplate)
              : templatedUrl
          })()
        : chain.rpcUrls.default.http[0]

      if (projectAccessKey && resolvedNodesUrl && isSequenceNodeUrl(resolvedNodesUrl)) {
        const urlWithAccessKey = appendAccessKey(resolvedNodesUrl, projectAccessKey)
        return [chain.id, http(urlWithAccessKey)]
      }

      return [chain.id, resolvedNodesUrl ? http(resolvedNodesUrl) : http()]
    })
  )
}

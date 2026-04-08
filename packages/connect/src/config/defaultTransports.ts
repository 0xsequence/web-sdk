import { http, type Chain } from 'viem'

import { getNetwork } from '../utils/networks.js'

const isSequenceNodeUrl = (url: string): boolean => {
  return url.includes('sequence.app')
}

const applyTemplate = (template: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template)
}

const resolveNetworkName = (chain: Chain, nodesUrl: string): string => {
  if (isSequenceNodeUrl(nodesUrl)) {
    return getNetwork(chain.id).name
  }

  return (chain as any).shortName ?? chain.name
}

const withSequenceNetworkPath = (url: string, networkName: string): string => {
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
  const pathSegments = cleanUrl.split('/').filter(Boolean)
  const hasNetworkPath =
    pathSegments[pathSegments.length - 1] === networkName || pathSegments[pathSegments.length - 2] === networkName

  if (hasNetworkPath) {
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
            const networkName = resolveNetworkName(chain, nodesUrl)
            const templatedUrl = applyTemplate(nodesUrl, { network: networkName })

            return isSequenceNodeUrl(nodesUrl) ? withSequenceNetworkPath(templatedUrl, networkName) : templatedUrl
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

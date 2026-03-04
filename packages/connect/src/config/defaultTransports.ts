import { http, type Chain } from 'viem'

const isSequenceNodeUrl = (url: string): boolean => {
  return url.includes('sequence.app')
}

const applyTemplate = (template: string, params: Record<string, string>): string => {
  return Object.entries(params).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template)
}

const appendAccessKey = (url: string, accessKey: string): string => {
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
  if (url.endsWith(accessKey)) {
    return url
  }

  return `${cleanUrl}/${accessKey}`
}

export const getDefaultTransports = (chains: readonly [Chain, ...Chain[]], projectAccessKey?: string, nodesUrl?: string) => {
  return Object.fromEntries(
    chains.map(chain => {
      const resolvedNodesUrl = nodesUrl
        ? applyTemplate(nodesUrl, { network: (chain as any).shortName ?? chain.name })
        : chain.rpcUrls.default.http[0]

      if (projectAccessKey && resolvedNodesUrl && isSequenceNodeUrl(resolvedNodesUrl)) {
        const urlWithAccessKey = appendAccessKey(resolvedNodesUrl, projectAccessKey)
        return [chain.id, http(urlWithAccessKey)]
      }

      return [chain.id, resolvedNodesUrl ? http(resolvedNodesUrl) : http()]
    })
  )
}

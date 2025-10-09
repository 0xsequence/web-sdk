import { http, type Chain } from 'viem'

const isSequenceNodeUrl = (url: string): boolean => {
  return url.includes('sequence.app')
}

const appendAccessKey = (url: string, accessKey: string): string => {
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url
  if (url.endsWith(accessKey)) {
    return url
  }

  return `${cleanUrl}/${accessKey}`
}

export const getDefaultTransports = (chains: readonly [Chain, ...Chain[]], projectAccessKey?: string) => {
  return Object.fromEntries(
    chains.map(chain => {
      const rpcUrl = chain.rpcUrls.default.http[0]

      if (projectAccessKey && rpcUrl && isSequenceNodeUrl(rpcUrl)) {
        const urlWithAccessKey = appendAccessKey(rpcUrl, projectAccessKey)
        return [chain.id, http(urlWithAccessKey)]
      }

      return [chain.id, http()]
    })
  )
}

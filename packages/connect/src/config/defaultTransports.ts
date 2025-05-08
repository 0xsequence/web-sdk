import { http, type Chain } from 'viem'

export const getDefaultTransports = (chains: readonly [Chain, ...Chain[]]) => {
  return Object.fromEntries(chains.map(chain => [chain.id, http()]))
}

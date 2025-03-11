import { Chain, http } from 'viem'

export const getDefaultTransports = (chains: readonly [Chain, ...Chain[]]) => {
  return Object.fromEntries(chains.map(chain => [chain.id, http()]))
}

import { providers } from 'ethers'
import { type HttpTransport, Account, Chain, Client, Transport } from 'viem'

export function walletClientToSigner(walletClient: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

export function publicClientToProvider(publicClient: Client<Transport, Chain>) {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(({ value }) => new providers.JsonRpcProvider(value?.url, network))
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

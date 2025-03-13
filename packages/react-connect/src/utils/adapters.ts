import { ethers } from 'ethers'
import { type HttpTransport, Account, Chain, Client, Transport } from 'viem'

export const walletClientToSigner = async (walletClient: Client<Transport, Chain, Account>) => {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }
  const provider = new ethers.BrowserProvider(transport, network)
  const signer = await provider.getSigner(account.address)
  return signer
}

export const publicClientToProvider = (publicClient: Client<Transport, Chain>) => {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }
  if (transport.type === 'fallback')
    return new ethers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(({ value }) => new ethers.JsonRpcProvider(value?.url, network))
    )
  return new ethers.JsonRpcProvider(transport.url, network)
}

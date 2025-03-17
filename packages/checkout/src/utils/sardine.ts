import { ChainId, networks } from '@0xsequence/network'
import { zeroAddress } from 'viem'

export interface CheckSardineWhitelistStatusArgs {
  chainId: number
  marketplaceAddress: string
}

export const checkSardineWhitelistStatus = async (
  { chainId, marketplaceAddress }: CheckSardineWhitelistStatusArgs,
  projectAccessKey: string,
  apiClientBaseUrl: string
) => {
  const referenceId = `sequence-kit-sardine-whitelist-check`

  const url = `${apiClientBaseUrl}/rpc/API/SardineGetNFTCheckoutToken`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': `${projectAccessKey}`
    },
    body: JSON.stringify({
      params: {
        referenceId,
        expiresIn: 3600,
        paymentMethodTypeConfig: {
          enabled: ['us_debit', 'us_credit', 'international_debit', 'international_credit', 'ach'],
          default: 'us_debit'
        },
        name: 'whitelist-check',
        imageUrl: 'https://www.sequence.market/images/placeholder.png',
        network: networks[chainId as ChainId].name,
        recipientAddress: zeroAddress,
        contractAddress: marketplaceAddress,
        platform: 'calldata_execution',
        executionType: 'smart_contract',
        blockchainNftId: '42',
        quantity: 1,
        decimals: 0,
        tokenAmount: '1000000',
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        tokenSymbol: 'USDC',
        tokenDecimals: 6,
        callData: '0x1'
      }
    })
  })

  const resJson = await res.json()

  if (typeof resJson?.cause === 'string' && resJson.cause.includes('It must be allow listed')) {
    return false
  }

  return true
}

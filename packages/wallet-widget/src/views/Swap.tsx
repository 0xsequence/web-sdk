import { SwapModalSettings, useSwapModal } from '@0xsequence/checkout'
import { parseAbi } from 'viem'
import { encodeFunctionData } from 'viem'

import { useSettings } from '../hooks'

export const Swap = () => {
  const { allNetworks } = useSettings()
  const { openSwapModal } = useSwapModal()

  console.log(allNetworks)

  const onClickSwap = () => {
    const chainId = 137
    const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    const currencyAmount = '20000'
    const data = encodeFunctionData({ abi: parseAbi(['function demo()']), functionName: 'demo', args: [] })

    const swapModalSettings: SwapModalSettings = {
      onSuccess: () => {
        console.log('swap successful!')
      },
      chainId,
      currencyAddress,
      currencyAmount,
      postSwapTransactions: [
        {
          to: '0x37470dac8a0255141745906c972e414b1409b470',
          data
        }
      ],
      title: 'Swap and Pay',
      description: 'Select a token in your wallet to swap to 0.2 USDC.'
    }

    openSwapModal(swapModalSettings)
  }

  return <div>text</div>
}

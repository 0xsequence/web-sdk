import { Box, Button, Spinner, Text } from '@0xsequence/design-system'
import {
  compareAddress,
  formatDisplay,
  useContractInfo,
  useSwapPrices,
  useSwapQuote,
  sendTransactions,
  useIndexerClient
} from '@0xsequence/kit'
import { findSupportedNetwork } from '@0xsequence/network'
import { useState } from 'react'
import { zeroAddress, formatUnits, Hex } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

import { HEADER_HEIGHT } from '../../constants'

export interface SwapCoinProps {
  contractAddress: string
  chainId: number
}

export const SwapCoin = ({ contractAddress, chainId }: SwapCoinProps) => {
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)

  const handleSendClick = () => {
    setIsSendTxnPending(true)
  }

  return (
    <Box
      padding="5"
      paddingTop="3"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      gap="2"
      flexDirection="column"
      as="form"
      onSubmit={handleSendClick}
      pointerEvents={isSendTxnPending ? 'none' : 'auto'}
    >
      <Text color="text100">Swap Coin</Text>
      <Text color="text100">{contractAddress}</Text>
      <Text color="text100">{chainId}</Text>
    </Box>
  )
}

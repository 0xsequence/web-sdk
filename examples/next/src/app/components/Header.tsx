import { Box, Image, Text, GradientAvatar } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { truncateAddress } from '@/utils'

export const Header = () => {
  const { address, connector } = useAccount()

  return (
    <Box position="fixed" width="full" padding="5" justifyContent="space-between">
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
        <Image style={{ width: '36px' }} src="kit-logo.svg" alt="Sequence kit" />
        <Image
          style={{
            width: '24px'
            // filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
          }}
          src="kit-logo-text.svg"
          alt="Sequence Kit Text Logo"
        />
      </Box>
      <Box>
        <Box flexDirection="column">
          <Box flexDirection="row" gap="2" justifyContent="flex-end" alignItems="center">
            <GradientAvatar address={String(address)} />
            <Text fontWeight="medium" fontSize="normal" color="text100">
              {truncateAddress(String(address), 8)}
            </Text>
          </Box>
          <Box alignItems="center" justifyContent="flex-end" flexDirection="row">
            <Text fontWeight="medium" fontSize="normal" color="text50">
              {connector?.name}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

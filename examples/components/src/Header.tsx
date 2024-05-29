import { Box, Image, Text, GradientAvatar, truncateAddress } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

export const Header = () => {
  const { address, connector } = useAccount()

  return (
    <Box
      position="fixed"
      top="0"
      width="full"
      padding="5"
      justifyContent="space-between"
      background="backgroundOverlay"
      backdropFilter="blur"
      zIndex="1"
      style={{ borderBottom: '1px solid #222' }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
        <Image style={{ width: '36px' }} src="images/kit-logo.svg" alt="Sequence kit" disableAnimation />
        <Image
          style={{
            width: '24px'
            // filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
          }}
          src="images/kit-logo-text.svg"
          alt="Sequence Kit Text Logo"
          disableAnimation
        />
      </Box>
      <Box>
        <Box flexDirection="column">
          <Box flexDirection="row" gap="2" justifyContent="flex-end" alignItems="center">
            <GradientAvatar address={String(address)} />
            <Text variant="normal" fontWeight="bold" color="text100">
              {truncateAddress(String(address), 8)}
            </Text>
          </Box>
          <Box alignItems="center" justifyContent="flex-end" flexDirection="row">
            <Text variant="small" color="text50">
              {connector?.name}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

import { Box, Text, SequenceIcon } from '@0xsequence/design-system'

export const Footer = () => {
  return (
    <Box paddingBottom="8" height="7" marginTop="1" width="full" style={{ bottom: '4px' }}>
      <Box gap="4" justifyContent="center" alignItems="center">
        <Box
          as="a"
          href="https://support.sequence.xyz/en/"
          rel="noopener noreferrer"
          target="_blank"
          textDecoration="none"
          opacity={{ hover: '80' }}
          cursor="pointer"
        >
          <Text color="text50" variant="xsmall">
            Help
          </Text>
        </Box>
        <Box
          as="a"
          href="https://sequence.xyz/privacy"
          rel="noopener noreferrer"
          target="_blank"
          textDecoration="none"
          opacity={{ hover: '80' }}
          cursor="pointer"
        >
          <Text color="text50" variant="xsmall">
            Privacy Policy
          </Text>
        </Box>
        <Box
          as="a"
          href="https://sequence.xyz/terms"
          rel="noopener noreferrer"
          target="_blank"
          textDecoration="none"
          opacity={{ hover: '80' }}
          cursor="pointer"
        >
          <Text color="text50" variant="xsmall">
            Terms of Service
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

import { Box, Text, SequenceIcon } from '@0xsequence/design-system'

export const Footer = () => {
  return (
    <Box position="fixed" height="7" marginTop="2" width="full" style={{ bottom: '4px' }}>
      <Box gap="4" justifyContent="center" alignItems="center">
        <Box
          as="a"
          href="https://sequence.xyz/"
          rel="noopener noreferrer"
          target="_blank"
          textDecoration="none"
          opacity={{ hover: '80' }}
          gap="1"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
        >
          <SequenceIcon color="text50" />
          <Text color="text50" variant="xsmall">
            Sequence
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
            Privacy
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
            Terms
          </Text>
        </Box>
        <Box
          as="a"
          href="https://docs.sequence.xyz/"
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
      </Box>
    </Box>
  )
}

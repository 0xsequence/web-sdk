import { Box, Text } from '@0xsequence/design-system'

import { SequenceLogo } from './SequenceLogo'

export const PoweredBySequence = () => {
  return (
    <Box
      className="powered-by-sequence-footer"
      position="relative"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.open('https://sequence.xyz')
        }
      }}
      gap="2"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      userSelect="none"
      cursor="pointer"
      opacity={{ hover: '80' }}
      style={{
        left: '-28px'
      }}
    >
      <Text variant="xsmall" color="text50" fontWeight="bold">
        Powered by
      </Text>
      <Box height="5" width="5" position="relative" style={{ top: '1px' }}>
        <SequenceLogo />
      </Box>
    </Box>
  )
}

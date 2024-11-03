import { Box, Text } from '@0xsequence/design-system'
import { HEADER_HEIGHT } from '../../constants'

export const Swap = () => {
  return (
    <Box
      flexDirection="column"
      gap="2"
      alignItems="flex-start"
      width="full"
      paddingBottom="6"
      paddingX="6"
      height="full"
      style={{
        paddingTop: HEADER_HEIGHT
      }}
    >
      <Text color="white">swap content</Text>
    </Box>
  )
}

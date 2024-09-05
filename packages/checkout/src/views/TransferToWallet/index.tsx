import { Box } from '@0xsequence/design-system'
import { HEADER_HEIGHT } from '../../constants'

export const TransferToWallet = () => {
  return (
    <Box
      flexDirection="column"
      gap='2'
      alignItems="flex-start"
      width="full"
      paddingX="4"
      paddingBottom="4"
      height="full"
      style={{ height: '600px', paddingTop: HEADER_HEIGHT }}
    >
      transfer to wallet content
    </Box>
  )
}
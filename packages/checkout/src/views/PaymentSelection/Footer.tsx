import { Box, Text } from '@0xsequence/design-system'
import { useSelectPaymentModal } from '../../hooks'

export const Footer = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()

  return (
    <Box
      paddingBottom="6"
      paddingTop="5"
      marginTop="1"
      width="full"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      {selectPaymentSettings?.copyrightText && (
        <Text color="text50" variant="normal" fontWeight="bold">
          {selectPaymentSettings.copyrightText}
        </Text>
      )}
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
          <Text color="text50" variant="normal" fontWeight="bold">
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
          <Text color="text50" variant="normal" fontWeight="bold">
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
          <Text color="text50" variant="normal" fontWeight="bold">
            Terms of Service
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

import { Text } from '@0xsequence/design-system'

import { useSelectPaymentModal } from '../../hooks'

export const Footer = () => {
  const { selectPaymentSettings } = useSelectPaymentModal()

  return (
    <div className="flex pb-6 pt-5 mt-1 w-full justify-center items-center flex-col">
      {selectPaymentSettings?.copyrightText && (
        <Text color="muted" variant="normal" fontWeight="bold">
          {selectPaymentSettings.copyrightText}
        </Text>
      )}
      <div className="flex gap-4 justify-center items-center">
        <a
          className="no-underline cursor-pointer"
          href="https://support.sequence.xyz/en/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Text color="muted" variant="normal" fontWeight="bold">
            Help
          </Text>
        </a>
        <a className="no-underline cursor-pointer" href="https://sequence.xyz/privacy" rel="noopener noreferrer" target="_blank">
          <Text color="muted" variant="normal" fontWeight="bold">
            Privacy Policy
          </Text>
        </a>
        <a className="no-underline cursor-pointer" href="https://sequence.xyz/terms" rel="noopener noreferrer" target="_blank">
          <Text color="muted" variant="normal" fontWeight="bold">
            Terms of Service
          </Text>
        </a>
      </div>
    </div>
  )
}

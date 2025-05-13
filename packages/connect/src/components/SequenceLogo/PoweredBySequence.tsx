import { Text } from '@0xsequence/design-system'

import { SequenceLogo } from './SequenceLogo.js'

export const PoweredBySequence = () => {
  return (
    <div
      className="powered-by-sequence-footer flex relative gap-1 flex-row items-center justify-center select-none cursor-pointer"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.open('https://sequence.xyz')
        }
      }}
    >
      <Text variant="xsmall" color="muted" fontWeight="bold">
        Powered by
      </Text>
      <SequenceLogo />
    </div>
  )
}

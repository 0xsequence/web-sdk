import { Text } from '@0xsequence/design-system'

import { SequenceLogo } from './SequenceLogo'

export const PoweredBySequence = () => {
  return (
    <div
      className="powered-by-sequence-footer flex relative gap-2 flex-row items-center justify-center select-none cursor-pointer left-[-28px]"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.open('https://sequence.xyz')
        }
      }}
    >
      <Text variant="xsmall" color="muted" fontWeight="bold">
        Powered by
      </Text>
      <div className="h-5 w-5 relative top-[1px]">
        <SequenceLogo />
      </div>
    </div>
  )
}

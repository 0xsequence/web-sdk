import { Text } from '@0xsequence/design-system';

import { SequenceLogo } from './SequenceLogo'

export const PoweredBySequence = () => {
  return (
    (<div
      className="powered-by-sequence-footer flex relative gap-2 flex-row items-center justify-center select-none cursor-pointer"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.open('https://sequence.xyz')
        }
      }}
      style={{
        left: '-28px'
      }}>
      <Text variant="xsmall" color="text50" fontWeight="bold">
        Powered by
      </Text>
      <div className="h-5 w-5 relative" style={{ top: '1px' }}>
        <SequenceLogo />
      </div>
    </div>)
  );
}

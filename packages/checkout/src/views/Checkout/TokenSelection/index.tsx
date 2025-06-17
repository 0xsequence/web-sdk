import { Text } from '@0xsequence/design-system'
import { HEADER_HEIGHT } from '../../../constants/index.js'

export const TokenSelectionContent = () => {
  return (
    <div
      className="px-3 pb-3 h-full w-full"
      style={{
        paddingTop: HEADER_HEIGHT
      }}
    >
      <Text color="text100">Select Token</Text>
    </div>
  )
}

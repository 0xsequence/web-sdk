import { Box } from '@0xsequence/design-system'

interface SelectedIndicatorProps {
  selected: boolean
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected } = props
  return (
    <Box
      borderStyle="solid"
      borderColor={'text50'}
      position="relative"
      alignItems="center"
      justifyContent="center"
      flexShrink="0"
      borderRadius="circle"
      width="7"
      height="7"
      style={{
        borderWidth: '2px'
      }}
    >
      <Box
        background={selected ? 'text80' : 'transparent'}
        position="absolute"
        borderRadius="circle"
        width="4"
        height="4"
        justifyContent="center"
        alignItems="center"
      />
    </Box>
  )
}

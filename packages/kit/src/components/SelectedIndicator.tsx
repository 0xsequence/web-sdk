import { Box, CheckmarkIcon } from '@0xsequence/design-system'

interface SelectedIndicatorProps {
  selected: boolean
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected } = props
  return (
    <Box
      borderStyle="solid"
      borderColor={selected ? 'white' : 'text50'}
      background={selected ? 'white' : 'transparent'}
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
      {selected && <CheckmarkIcon color="black" size="md" />}
    </Box>
  )
}

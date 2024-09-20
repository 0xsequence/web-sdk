import { Box, vars } from '@0xsequence/design-system'

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
      style={{
        borderWidth: '2px',
        borderRadius: vars.radii.circle,
        width: '28px',
        height: '28px'
      }}
    >
      <Box
        background={selected ? 'text80' : 'transparent'}
        position="absolute"
        style={{
          borderRadius: vars.radii.circle,
          width: '16px',
          height: '16px'
        }}
        justifyContent="center"
        alignItems="center"
      />
    </Box>
  )
}

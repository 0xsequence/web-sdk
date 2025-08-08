import { CheckmarkIcon } from '@0xsequence/design-system'

interface SelectedIndicatorProps {
  selected: boolean
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected } = props
  const background = selected ? 'bg-white' : 'bg-transparent'
  return (
    <div
      className={`flex border-solid relative items-center justify-center shrink-0 rounded-full w-7 h-7 ${background}`}
      style={{
        borderWidth: '2px',
        borderColor: selected ? 'var(--seq-color-white)' : 'var(--seq-color-muted)'
      }}
    >
      {selected && <CheckmarkIcon className="text-black" size="md" />}
    </div>
  )
}

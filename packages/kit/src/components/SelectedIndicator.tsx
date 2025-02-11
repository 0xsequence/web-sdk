import { CheckmarkIcon } from '@0xsequence/design-system';

interface SelectedIndicatorProps {
  selected: boolean
}

export const SelectedIndicator = (props: SelectedIndicatorProps) => {
  const { selected } = props
  return (
    (<div
      className="flex border-solid relative items-center justify-center shrink-0 rounded-full w-7 h-7"
      style={{
        borderWidth: '2px'
      }}>
      {selected && <CheckmarkIcon className="text-black" size="md" />}
    </div>)
  );
}

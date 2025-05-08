import { Button, CheckmarkIcon, CopyIcon } from '@0xsequence/design-system'
import { useClipboard } from '@0xsequence/hooks'
import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<typeof Button>

interface CopyButtonProps extends ButtonProps {
  text: string
  buttonVariant: 'icon' | 'with-label'
}

export const CopyButton = (props: CopyButtonProps) => {
  const { buttonVariant = 'icon', text, size = 'xs', ...rest } = props
  const [isCopied, setCopied] = useClipboard({ timeout: 4000 })

  const label = isCopied ? 'Copied!' : 'Copy'

  return (
    <Button
      size={size!}
      leftIcon={isCopied ? CheckmarkIcon : CopyIcon}
      label={buttonVariant === 'with-label' ? label : undefined}
      variant={buttonVariant === 'icon' ? 'ghost' : 'glass'}
      onClick={() => setCopied(text)}
      {...rest}
    />
  )
}

import { Button, CheckmarkIcon, CopyIcon } from '@0xsequence/design-system'
import { useEffect, useState, type ComponentProps } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

type ButtonProps = ComponentProps<typeof Button>

interface CopyButtonProps extends ButtonProps {
  text: string
  buttonVariant: 'icon' | 'with-label'
}

export const CopyButton = (props: CopyButtonProps) => {
  const { buttonVariant = 'icon', text, size = 'xs', ...rest } = props
  const [isCopied, setCopy] = useState(false)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setCopy(false)
      }, 2000)
    }
  }, [isCopied])

  const handleCopy = () => {
    setCopy(true)
  }

  const label = isCopied ? 'Copied!' : 'Copy'

  return (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <Button
        size={size!}
        leftIcon={isCopied ? CheckmarkIcon : CopyIcon}
        label={buttonVariant === 'with-label' ? label : undefined}
        variant={buttonVariant === 'icon' ? 'ghost' : 'glass'}
        {...rest}
      />
    </CopyToClipboard>
  )
}

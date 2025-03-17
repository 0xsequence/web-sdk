import { Button, CopyIcon, CheckmarkIcon } from '@0xsequence/design-system'
import { useEffect, useState, ComponentProps } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

type ButtonProps = ComponentProps<typeof Button>

interface CopyButtonProps extends ButtonProps {
  text: string
  inline?: boolean
}

export const CopyButton = (props: CopyButtonProps) => {
  const { text, size = 'xs', inline = false, ...rest } = props
  const [isCopied, setCopy] = useState(false)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setCopy(false)
      }, 4000)
    }
  }, [isCopied])

  const handleCopy = () => {
    setCopy(true)
  }

  return (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      {inline ? (
        <Button size={size} variant="text" leftIcon={isCopied ? CheckmarkIcon : CopyIcon} />
      ) : (
        <Button size={size} leftIcon={isCopied ? CheckmarkIcon : CopyIcon} label={isCopied ? 'Copied' : 'Copy'} {...rest} />
      )}
    </CopyToClipboard>
  )
}

import { Button, CopyIcon, CheckmarkIcon, Icon, IconButton, vars } from '@0xsequence/design-system'
import React, { useEffect, useState, ComponentProps } from 'react'
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
      }, 4000)
    }
  }, [isCopied])

  const handleCopy = () => {
    setCopy(true)
  }

  const label = isCopied ? 'Copied!' : 'Copy'
  const backgroundColor = buttonVariant === 'icon' ? 'rgba(0,0,0,0)' : vars.colors.buttonGlass

  return (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <IconButton
        size={size}
        icon={isCopied ? CheckmarkIcon : CopyIcon}
        {...rest}
        style={{ background: backgroundColor, ...props?.style }}
        label={buttonVariant === 'with-label' ? label : undefined}
      />
    </CopyToClipboard>
  )
}

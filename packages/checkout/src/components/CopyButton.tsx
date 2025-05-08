import { Button, CheckmarkIcon, CopyIcon } from '@0xsequence/design-system'
import { useClipboard } from '@0xsequence/hooks'
import React, { type ComponentProps } from 'react'

type ButtonProps = ComponentProps<typeof Button>

interface CopyButtonProps extends ButtonProps {
  text: string
  inline?: boolean
}

export const CopyButton = (props: CopyButtonProps) => {
  const { text, size = 'xs', inline = false, ...rest } = props
  const [isCopied, setCopied] = useClipboard({ timeout: 4000 })

  return inline ? (
    <Button size={size} variant="text" leftIcon={isCopied ? CheckmarkIcon : CopyIcon} onClick={() => setCopied(text)} />
  ) : (
    <Button
      size={size}
      leftIcon={isCopied ? CheckmarkIcon : CopyIcon}
      label={isCopied ? 'Copied' : 'Copy'}
      onClick={() => setCopied(text)}
      {...rest}
    />
  )
}

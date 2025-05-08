import copy from 'copy-to-clipboard'
import { useEffect, useState } from 'react'

interface UseClipboardProps {
  timeout?: number
}

export const useClipboard = (props?: UseClipboardProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const timeout = props && props.timeout

  useEffect(() => {
    if (isCopied) {
      const id = setTimeout(() => {
        setIsCopied(false)
      }, timeout)

      return () => {
        clearTimeout(id)
      }
    }
  }, [isCopied, timeout])

  return [
    isCopied,
    (text: string) => {
      copy(text)
      setIsCopied(true)
    }
  ] as const
}

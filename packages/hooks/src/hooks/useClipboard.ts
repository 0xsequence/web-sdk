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
    async (text: string) => {
      return copy(text).then(() => {
        setIsCopied(true)
      })
    }
  ] as const
}

const copy = async (text: string): Promise<void> => {
  if (!navigator?.clipboard) {
    throw new Error('Clipboard API not supported')
  }

  return navigator.clipboard.writeText(text)
}

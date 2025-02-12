import { useEffect, useRef } from 'react'

interface UseSkipOnCloseCallbackReturn {
  skipOnCloseCallback: () => void
}

export const useSkipOnCloseCallback = (onClose: () => void): UseSkipOnCloseCallbackReturn => {
  const skipOnCloseCallbackFlag = useRef(false)

  const skipOnCloseCallback = () => {
    skipOnCloseCallbackFlag.current = true
  }

  useEffect(() => {
    return () => {
      if (!skipOnCloseCallbackFlag.current) {
        onClose()
      }
    }
  }, [])

  return {
    skipOnCloseCallback
  }
}

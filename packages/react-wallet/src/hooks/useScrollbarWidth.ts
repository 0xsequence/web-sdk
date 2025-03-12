import { useEffect, useState } from 'react'

export const useScrollbarWidth = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState<string>('0px')

  useEffect(() => {
    setScrollbarWidth(navigator.userAgent.match(/chrome|chromium|crios/i) ? '13px' : '0px')
  }, [])

  return scrollbarWidth
}

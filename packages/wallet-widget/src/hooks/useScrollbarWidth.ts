import { useEffect, useState } from 'react'

/**
 * Hook that returns the browser's scrollbar width based on the user agent.
 * Specifically handles Chrome-based browsers differently from others.
 *
 * @returns {string} The scrollbar width as a CSS pixel value:
 * - Returns '13px' for Chrome-based browsers (Chrome, Chromium, Chrome iOS)
 * - Returns '0px' for all other browsers
 */
export const useScrollbarWidth = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState<string>('0px')

  useEffect(() => {
    setScrollbarWidth(navigator.userAgent.match(/chrome|chromium|crios/i) ? '13px' : '0px')
  }, [])

  return scrollbarWidth
}

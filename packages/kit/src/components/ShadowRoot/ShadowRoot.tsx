import { ThemeProvider } from '@0xsequence/design-system'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ShadowRootProps {
  children: ReactNode
}

export const ShadowRoot = (props: ShadowRootProps) => {
  const { children } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (hostRef.current) {
      const shadowRoot = hostRef.current.attachShadow({ mode: 'open' })

      try {
        const allStyles = document.querySelectorAll('style')
        const combinedStyles = Array.from(allStyles)
          .map(style => style.textContent)
          .join('\n')

        const sheet = new CSSStyleSheet()
        sheet.replaceSync(combinedStyles)
        shadowRoot.adoptedStyleSheets = [sheet]

        const container = document.createElement('div')
        container.id = 'sequence-kit-shadow-root'
        shadowRoot.appendChild(container)
        setContainer(container)
      } catch (error) {
        console.error('Failed to load styles:', error)
      }
    }
  }, [])

  return (
    <>
      <div id="sequence-kit-shadow-host" ref={hostRef} />
      {container && createPortal(<ThemeProvider root={container ?? undefined}>{children}</ThemeProvider>, container)}
    </>
  )
}

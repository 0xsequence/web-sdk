'use client'

import { ThemeProvider, Theme } from '@0xsequence/design-system'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { styles } from '../../styles'

// Create a stylesheet which is shared by all ShadowRoot components
let sheet: CSSStyleSheet
const getCSSStyleSheet = () => {
  if (!sheet) {
    sheet = new CSSStyleSheet()
    sheet.replaceSync(styles)
  }

  return sheet
}

interface ShadowRootProps {
  theme?: Theme
  children: ReactNode
}

export const ShadowRoot = (props: ShadowRootProps) => {
  const { theme, children } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) {
      // Create a shadow root
      const shadowRoot = hostRef.current.attachShadow({ mode: 'open' })

      // Attach the stylesheet
      shadowRoot.adoptedStyleSheets = [getCSSStyleSheet()]

      // Create a container
      const container = document.createElement('div')
      container.id = 'shadow-root-container'
      shadowRoot.appendChild(container)

      setContainer(container)
    }
  }, [])

  return (
    <>
      <div data-shadow-host ref={hostRef} />
      {container && (
        <ThemeProvider theme={theme} root={container}>
          {children}
        </ThemeProvider>
      )}
    </>
  )
}

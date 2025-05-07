'use client'

import { ThemeProvider, Theme } from '@0xsequence/design-system'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { styles } from '../../styles'

// Create a stylesheet which is shared by all ShadowRoot components
let sheet: CSSStyleSheet
const getCSSStyleSheet = (customCSS?: string) => {
  if (!sheet) {
    sheet = new CSSStyleSheet()
    sheet.replaceSync(styles + (customCSS ? `\n\n${customCSS}` : ''))
  }

  return sheet
}

interface ShadowRootProps {
  theme?: Theme
  children: ReactNode
  customCSS?: string
}

export const ShadowRoot = (props: ShadowRootProps) => {
  const { theme, children, customCSS } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [windowDocument, setWindowDocument] = useState<Document | null>(null)

  useEffect(() => {
    setWindowDocument(document)
  }, [])

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) {
      // Create a shadow root
      const shadowRoot = hostRef.current.attachShadow({ mode: 'open' })

      // Attach the stylesheet
      shadowRoot.adoptedStyleSheets = [getCSSStyleSheet(customCSS)]

      // Create a container
      const container = document.createElement('div')
      container.id = 'shadow-root-container'
      shadowRoot.appendChild(container)

      setContainer(container)
    }
  }, [windowDocument])

  return windowDocument
    ? createPortal(
        <div data-shadow-host ref={hostRef}>
          {container && (
            <ThemeProvider theme={theme} root={container}>
              {children}
            </ThemeProvider>
          )}
        </div>,
        document.body
      )
    : null
}

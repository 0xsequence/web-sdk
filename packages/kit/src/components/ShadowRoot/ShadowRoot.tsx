'use client'

import { ThemeProvider, Theme } from '@0xsequence/design-system'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { styles } from '../../styles'

// Create a stylesheet which is shared by all ShadowRoot components
const sheet = new CSSStyleSheet()
sheet.replaceSync(styles)

interface ShadowRootProps {
  theme?: Theme
  children: ReactNode
}

export const ShadowRoot = (props: ShadowRootProps) => {
  const { theme, children } = props
  const hostRef = useRef<HTMLDivElement>(null)
  // const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (hostRef.current) {
      // Create a shadow root
      const shadowRoot = hostRef.current.attachShadow({ mode: 'open' })

      // Attach the stylesheet
      shadowRoot.adoptedStyleSheets = [sheet]

      // Create a container
      const container = document.createElement('div')
      container.id = 'sequence-kit-shadow-root'
      shadowRoot.appendChild(container)

      //setShadowRoot(shadowRoot)
      setContainer(container)
    }
  }, [])

  return (
    <>
      <div data-shadow-host ref={hostRef} />
      {container &&
        createPortal(
          <ThemeProvider theme={theme} root={container ?? undefined}>
            {children}
          </ThemeProvider>,
          container
        )}
    </>
  )
}

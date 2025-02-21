import { ThemeProvider } from '@0xsequence/design-system'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { styles } from './styles'

interface ShadowRootProps {
  children: ReactNode
}

export const ShadowRoot = (props: ShadowRootProps) => {
  const { children } = props
  const hostRef = useRef<HTMLDivElement>(null)
  // const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (hostRef.current) {
      const shadowRoot = hostRef.current.attachShadow({ mode: 'open' })

      // Create a style element
      const style = document.createElement('style')
      style.textContent = styles
      shadowRoot.appendChild(style)

      // Create a container
      const container = document.createElement('div')
      container.id = 'sequence-kit-shadow-root'
      shadowRoot.appendChild(container)

      //setShadowRoot(shadowRoot)
      setContainer(container)

      // retargetEvents(shadowRoot)
    }
  }, [])

  return (
    <>
      <div id="sequence-kit-shadow-host" ref={hostRef} />
      {container && createPortal(<ThemeProvider root={container ?? undefined}>{children}</ThemeProvider>, container)}
    </>
  )
}

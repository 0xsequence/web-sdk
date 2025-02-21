import { ThemeProvider } from '@0xsequence/design-system'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { styles } from './styles'

function retargetEvents(shadowRoot: ShadowRoot) {
  // List of events you need to retarget. Adjust as necessary.
  const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend']

  events.forEach(eventName => {
    shadowRoot.addEventListener(eventName, event => {
      if (event instanceof MouseEvent) {
        console.log('Got a mouse event', event.type)
        const newEvent = new MouseEvent(event.type, {
          bubbles: event.bubbles,
          cancelable: event.cancelable,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY
        })

        shadowRoot.host.dispatchEvent(newEvent)
      }

      // const newEvent = new Event(event.type, event)
      // shadowRoot.host.dispatchEvent(newEvent)
    })
  })
}

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

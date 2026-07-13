import { Skeleton } from '@0xsequence/design-system'
import type { CredentialResponse, GsiButtonConfiguration, IdConfiguration } from '@react-oauth/google'
import { useEffect, useRef, useState } from 'react'

export type GoogleButtonTheme = 'outline' | 'outline_dark' | 'filled_blue' | 'filled_black'

interface RoutedCredentialResponse extends CredentialResponse {
  state?: string
}

interface GoogleButtonConfiguration extends Omit<GsiButtonConfiguration, 'theme'> {
  state?: string
  theme?: GoogleButtonTheme
}

interface GoogleIdentityApi {
  initialize: (config: IdConfiguration) => void
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
}

interface GoogleSignInButtonProps extends Omit<GsiButtonConfiguration, 'theme' | 'click_listener'> {
  clientId: string
  theme?: GoogleButtonTheme
  onSuccess: (credentialResponse: CredentialResponse) => void
  onError?: () => void
}

const buttonHeights = {
  large: 40,
  medium: 32,
  small: 20
} as const
const MIN_LOADING_DURATION_MS = 600

type CredentialHandler = (credentialResponse: CredentialResponse) => void

let initializedGoogleIdentity: GoogleIdentityApi | undefined
let initializedGoogleClientId: string | undefined
let nextGoogleButtonId = 0
const credentialHandlers = new Map<string, CredentialHandler>()

const getGoogleIdentity = (): GoogleIdentityApi | undefined => (window as any).google?.accounts?.id

const initializeGoogleIdentity = (googleIdentity: GoogleIdentityApi, clientId: string) => {
  if (initializedGoogleIdentity === googleIdentity) {
    if (initializedGoogleClientId !== clientId) {
      console.error('Google Identity Services cannot be initialized with multiple client IDs on the same page.')
      return false
    }
    return true
  }

  googleIdentity.initialize({
    client_id: clientId,
    callback: credentialResponse => {
      const buttonState = (credentialResponse as RoutedCredentialResponse).state
      const credentialHandler = buttonState ? credentialHandlers.get(buttonState) : undefined

      if (!credentialHandler) {
        console.error('Unable to match the Google credential response to the button that initiated it.')
        return
      }

      credentialHandler(credentialResponse)
    }
  })
  initializedGoogleIdentity = googleIdentity
  initializedGoogleClientId = clientId
  return true
}

export const GoogleSignInButton = ({
  clientId,
  onSuccess,
  onError,
  type = 'standard',
  theme = 'outline',
  size = 'large',
  text,
  shape,
  logo_alignment,
  width,
  locale
}: GoogleSignInButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const buttonStateRef = useRef<string | null>(null)
  if (buttonStateRef.current === null) {
    buttonStateRef.current = `sequence-google-${++nextGoogleButtonId}`
  }
  const buttonState = buttonStateRef.current
  const renderSignature = [clientId, type, theme, size, text, shape, logo_alignment, width, locale].join('|')
  const [readySignature, setReadySignature] = useState<string>()
  const isReady = readySignature === renderSignature
  const buttonHeight = buttonHeights[size]
  const containerWidth =
    type === 'icon' ? buttonHeight : typeof width === 'string' && /^\d+$/.test(width) ? Number(width) : (width ?? '100%')

  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    if (!clientId) {
      containerRef.current?.replaceChildren()
      return
    }

    let isCancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let revealTimer: ReturnType<typeof setTimeout> | undefined
    let renderedIframe: HTMLIFrameElement | undefined
    const loadingStartedAt = performance.now()

    const handleCredential = (credentialResponse: CredentialResponse) => {
      if (credentialResponse.credential) {
        onSuccessRef.current(credentialResponse)
      } else {
        onErrorRef.current?.()
      }
    }

    const handleIframeLoad = () => {
      if (!isCancelled && renderedIframe?.src.includes('accounts.google.com/gsi/button')) {
        const remainingLoadingTime = Math.max(0, MIN_LOADING_DURATION_MS - (performance.now() - loadingStartedAt))
        if (revealTimer) {
          clearTimeout(revealTimer)
        }
        revealTimer = setTimeout(() => setReadySignature(renderSignature), remainingLoadingTime)
      }
    }

    const findRenderedIframe = () => {
      const nextIframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe[src*="accounts.google.com/gsi/button"]')
      if (!nextIframe || nextIframe === renderedIframe) {
        return
      }

      renderedIframe?.removeEventListener('load', handleIframeLoad)
      renderedIframe = nextIframe
      renderedIframe.addEventListener('load', handleIframeLoad, { once: true })
    }

    const mutationObserver = new MutationObserver(findRenderedIframe)

    const renderButton = () => {
      if (isCancelled) {
        return
      }

      const googleIdentity = getGoogleIdentity()
      const container = containerRef.current
      if (!googleIdentity || !container) {
        retryTimer = setTimeout(renderButton, 50)
        return
      }

      container.replaceChildren()
      credentialHandlers.set(buttonState, handleCredential)
      if (!initializeGoogleIdentity(googleIdentity, clientId)) {
        credentialHandlers.delete(buttonState)
        onErrorRef.current?.()
        return
      }

      mutationObserver.observe(container, { childList: true, subtree: true })
      googleIdentity.renderButton(container, {
        type,
        theme,
        size,
        text,
        shape,
        logo_alignment,
        width,
        locale,
        state: buttonState
      })
      findRenderedIframe()
    }

    renderButton()

    return () => {
      isCancelled = true
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
      if (revealTimer) {
        clearTimeout(revealTimer)
      }
      mutationObserver.disconnect()
      renderedIframe?.removeEventListener('load', handleIframeLoad)
      containerRef.current?.replaceChildren()
      if (credentialHandlers.get(buttonState) === handleCredential) {
        credentialHandlers.delete(buttonState)
      }
    }
  }, [buttonState, clientId, type, theme, size, text, shape, logo_alignment, width, locale, renderSignature])

  return (
    <div className="relative max-w-full" style={{ width: containerWidth, height: buttonHeight }} aria-busy={!isReady}>
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 z-10 h-full w-full rounded-full" aria-hidden>
          <Skeleton className="h-full w-full rounded-full" />
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          height: buttonHeight,
          visibility: isReady ? 'visible' : 'hidden'
        }}
      />
      {!isReady && (
        <span className="sr-only" role="status">
          Loading Google sign-in
        </span>
      )}
    </div>
  )
}

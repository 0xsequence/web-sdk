import { AUTH_STATUS_TIMEOUT_MS } from '../constants.js'

import { normalizeWalletUrl } from './walletConfiguration.js'

type AuthStatusData = {
  authState?: 'signed-in' | 'signed-out'
  [key: string]: unknown
}

/**
 * Checks if the user is logged in by calling the auth status endpoint.
 *
 * ## Why JSONP instead of fetch?
 *
 * This function uses JSONP (JSON with Padding) instead of a standard `fetch` request for
 * important cross-origin cookie access reasons:
 *
 * 1. **Third-party cookie restrictions**: Modern browsers (especially Safari) heavily restrict
 *    third-party cookie access. When using `fetch` with `credentials: 'include'`, the browser
 *    may block cookies from being sent to a different origin (e.g., wallet.sequence.app from
 *    your dapp's domain).
 *
 * 2. **JSONP bypasses cookie restrictions**: JSONP works by dynamically inserting a `<script>`
 *    tag. Script tags are treated as first-party requests by browsers, allowing cookies to be
 *    sent with the request. The wallet's auth endpoint uses these cookies to determine login status.
 *
 * 3. **No CORS preflight**: JSONP also avoids CORS preflight requests (OPTIONS), which can
 *    introduce latency and additional complexity.
 *
 * ## How it works
 *
 * 1. We create a unique callback function name and register it on `window`
 * 2. We inject a `<script>` tag pointing to the auth status endpoint with the callback name
 * 3. The endpoint returns JavaScript like: `callbackName({ authState: 'signed-in' })`
 * 4. When the script executes, it calls our callback with the auth data
 * 5. We clean up the script tag and callback function
 *
 * ## Security considerations
 *
 * - Only trusted wallet URLs should be passed to this function
 * - The callback name includes randomness to prevent collisions and hijacking
 * - We restore any original window property that may have been shadowed
 *
 * @param walletUrl - The wallet URL to check auth status against (must be a trusted endpoint)
 * @returns Promise<boolean> - Returns true if user is logged in, false otherwise
 */
export const checkAuthStatus = async (walletUrl: string): Promise<boolean> => {
  const normalizedUrl = normalizeWalletUrl(walletUrl)

  if (!normalizedUrl) {
    return false
  }

  return new Promise<boolean>(resolve => {
    let resolved = false
    const callbackName = `sequenceAuthStatusCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const originalCallback = (window as any)[callbackName]

    // Create script tag to load the JSONP endpoint
    const script = document.createElement('script')
    script.src = `${normalizedUrl}/api/auth/status.js?callback=${callbackName}&_=${Date.now()}`
    script.async = true
    script.defer = true

    // Cleanup helper to avoid code duplication
    const cleanup = () => {
      script.remove()
      if (originalCallback) {
        ;(window as any)[callbackName] = originalCallback
      } else {
        delete (window as any)[callbackName]
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    // Create a callback that will receive the auth status data
    const authCallback = (data: AuthStatusData) => {
      if (resolved) {
        return
      }
      resolved = true
      cleanup()

      // Check if user is signed in
      const isV3WalletSignedIn = data.authState === 'signed-in'
      resolve(isV3WalletSignedIn)
    }

    // Set up the global callback function
    ;(window as any)[callbackName] = authCallback

    // Handle script load - if callback wasn't called, resolve as false after a short delay
    script.addEventListener('load', () => {
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          cleanup()
          resolve(false)
        }
      }, 0)
    })

    // Handle script error
    script.addEventListener('error', () => {
      if (!resolved) {
        resolved = true
        cleanup()
        console.warn('Failed to load auth status script')
        resolve(false)
      }
    })

    // Timeout fallback in case callback is never called
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        resolve(false)
      }
    }, AUTH_STATUS_TIMEOUT_MS)

    // Append script to document head to trigger load
    document.head.appendChild(script)
  })
}

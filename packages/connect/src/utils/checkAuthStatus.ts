import { normalizeWalletUrl } from './walletConfiguration.js'

type AuthStatusData = {
  authState?: 'signed-in' | 'signed-out'
  [key: string]: unknown
}

/**
 * Checks if the user is logged in by calling the auth status endpoint
 * The endpoint uses JSONP pattern - it returns JavaScript that calls a callback function
 * @param walletUrl - The wallet URL to check auth status against
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

    // Create a callback that will receive the auth status data
    const authCallback = (data: AuthStatusData) => {
      if (resolved) {
        return
      }
      resolved = true

      // Clean up script and callback
      script.remove()
      if (originalCallback) {
        ;(window as any)[callbackName] = originalCallback
      } else {
        delete (window as any)[callbackName]
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

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
          script.remove()
          if (originalCallback) {
            ;(window as any)[callbackName] = originalCallback
          } else {
            delete (window as any)[callbackName]
          }
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          resolve(false)
        }
      }, 0)
    })

    // Handle script error
    script.addEventListener('error', () => {
      if (!resolved) {
        resolved = true
        script.remove()
        if (originalCallback) {
          ;(window as any)[callbackName] = originalCallback
        } else {
          delete (window as any)[callbackName]
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        console.warn('Failed to load auth status script')
        resolve(false)
      }
    })

    // Timeout fallback in case callback is never called
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        script.remove()
        if (originalCallback) {
          ;(window as any)[callbackName] = originalCallback
        } else {
          delete (window as any)[callbackName]
        }
        resolve(false)
      }
    }, 5000) // 5 second timeout

    // Append script to document head to trigger load
    document.head.appendChild(script)
  })
}

/**
 * Connect SDK constants
 *
 * This file contains magic numbers and configuration values used throughout the SDK.
 * Centralizing these values makes them easier to find, understand, and tune.
 */

/**
 * Debounce delay in milliseconds for the wallet list updates.
 *
 * This delay helps prevent UI flicker when wagmi is reconnecting or when
 * wallet connections are rapidly changing. A value of 120ms balances
 * responsiveness with stability - it's short enough to feel instant but
 * long enough to avoid flickering during transient connection states.
 */
export const WALLET_LIST_DEBOUNCE_MS = 120

/**
 * Timeout in milliseconds for the auth status JSONP request.
 *
 * If the JSONP callback is not invoked within this time, we assume
 * the user is not authenticated. 5 seconds is generous enough to handle
 * slow networks while not leaving users waiting indefinitely.
 */
export const AUTH_STATUS_TIMEOUT_MS = 5000

/**
 * Minimum supported wagmi version for internal API access.
 *
 * The setChains utility accesses wagmi's internal API (`config._internal`).
 * This constant documents which version the implementation was tested against.
 */
export const WAGMI_MIN_TESTED_VERSION = '2.0.0'

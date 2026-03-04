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
 * the user is not authenticated. 3 seconds balances slow networks while
 * avoiding long hangs on blocked requests.
 */
export const AUTH_STATUS_TIMEOUT_MS = 3000

/**
 * Minimum supported wagmi version for internal API access.
 *
 * The setChains utility accesses wagmi's internal API (`config._internal`).
 * This constant documents which version the implementation was tested against.
 */
export const WAGMI_MIN_TESTED_VERSION = '3.2.0'

/**
 * Timeout in milliseconds for fetching wallet configuration.
 *
 * Prevents the UI from getting stuck when the request is slow, blocked by CORS,
 * or cancelled by the browser.
 */
export const WALLET_CONFIGURATION_TIMEOUT_MS = 3000

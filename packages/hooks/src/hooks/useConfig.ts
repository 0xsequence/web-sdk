import { useContext } from 'react'

import { SequenceHooksContext } from '../contexts/ConfigContext'

/**
 * Hook to access the Sequence configuration context.
 * Must be used within a {@link SequenceHooksProvider} component.
 *
 * Provides access to global configuration values used across Sequence hooks, including:
 * - `env`: Environment configuration (API URLs, metadata URLs, etc.)
 * - `projectAccessKey`: Project-specific access key
 * - `jwt`: JSON Web Token for authentication
 *
 * @see {@link https://docs.sequence.xyz/sdk/web/hooks/useConfig} for more detailed documentation.
 *
 * @throws {Error} If used outside of a SequenceHooksProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { env, projectAccessKey } = useConfig()
 *
 *   return (
 *     <div>
 *       <div>API URL: {env.apiUrl}</div>
 *       <div>Project Key: {projectAccessKey}</div>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Usage with provider
 * function App() {
 *   return (
 *     <SequenceHooksProvider config={{
 *       env: {
 *         apiUrl: '...',
 *         metadataUrl: '...',
 *         imageProxyUrl: '...'
 *       },
 *       projectAccessKey: 'your-project-key'
 *     }}>
 *       <MyComponent />
 *     </SequenceHooksProvider>
 *   )
 * }
 */
export const useConfig = () => {
  const config = useContext(SequenceHooksContext)

  if (!config) {
    throw new Error('useConfig must be used within a SequenceHooksProvider')
  }

  return config
}

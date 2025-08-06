import { Text } from '@0xsequence/design-system'
import { useEffect } from 'react'

export function XAuthCallback() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)

    const payload = {
      code: query.get('code'),
      state: query.get('state')
    }

    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_RETURN', data: payload }, '*')
    }

    window.close()
  }, [])

  return (
    <div className="flex justify-center items-center w-full pt-10">
      <Text variant="large" color="primary">
        You may now close this window.
      </Text>
    </div>
  )
}

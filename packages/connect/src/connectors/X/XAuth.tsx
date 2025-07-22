export const getXOauthUrl = async (XClientId: string, XRedirectURI: string, codeChallenge?: string) => {
  const roolUrl = 'https://twitter.com/i/oauth2/authorize'
  const options = {
    redirect_uri: XRedirectURI as string,
    client_id: XClientId as string,
    state: 'state',
    response_type: 'code',
    scope: 'users.read users.email tweet.read',
    code_challenge: codeChallenge ?? '',
    code_challenge_method: 'S256'
  }
  const queryString = new URLSearchParams(options).toString()

  return `${roolUrl}?${queryString}`
}

function base64urlencode(a: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function getPkcePair() {
  const array = new Uint8Array(32)
  window.crypto.getRandomValues(array)
  const code_verifier = base64urlencode(array)

  const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(code_verifier))
  const code_challenge = base64urlencode(hash)

  return { code_verifier, code_challenge }
}

export async function getXIdToken(code: string, codeVerifier: string, XClientId: string, XRedirectURI: string) {
  // NOTE: when testing locally, you must use a cors proxy and append the proxy url in front of the fetch url like so:
  // 'http://localhost:8080/https://api.x.com/2/oauth2/token'
  const response = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: XClientId,
      redirect_uri: XRedirectURI,
      code_verifier: codeVerifier
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  const data = await response.json()
  return data.access_token
}

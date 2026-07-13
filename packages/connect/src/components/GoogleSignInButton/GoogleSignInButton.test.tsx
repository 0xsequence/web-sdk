import type { CredentialResponse, GsiButtonConfiguration, IdConfiguration } from '@react-oauth/google'
import { act, cleanup, render } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GoogleSignInButton } from './GoogleSignInButton.js'

vi.mock('@0xsequence/design-system', () => ({
  Skeleton: ({ className }: { className?: string }) => <div className={className} data-testid="skeleton" />
}))

interface RoutedCredentialResponse extends CredentialResponse {
  state?: string
}

interface TestButtonConfiguration extends GsiButtonConfiguration {
  state?: string
}

const installGoogleIdentity = () => {
  let credentialCallback: IdConfiguration['callback']
  const initialize = vi.fn((config: IdConfiguration) => {
    credentialCallback = config.callback
  })
  const renderButton = vi.fn((container: HTMLElement, _options: TestButtonConfiguration) => {
    const iframe = document.createElement('iframe')
    iframe.src = 'https://accounts.google.com/gsi/button'
    container.append(iframe)
  })

  ;(window as any).google = { accounts: { id: { initialize, renderButton } } }

  return {
    initialize,
    renderButton,
    respond: (response: RoutedCredentialResponse) => credentialCallback?.(response)
  }
}

const renderedButtonState = (renderButton: ReturnType<typeof installGoogleIdentity>['renderButton'], callIndex: number) =>
  renderButton.mock.calls[callIndex][1].state

afterEach(() => {
  cleanup()
  delete (window as any).google
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('GoogleSignInButton', () => {
  it('routes credentials to the button that initiated sign-in', () => {
    const googleIdentity = installGoogleIdentity()
    const firstOnSuccess = vi.fn()
    const secondOnSuccess = vi.fn()

    render(
      <>
        <GoogleSignInButton clientId="client-id" onSuccess={firstOnSuccess} />
        <GoogleSignInButton clientId="client-id" onSuccess={secondOnSuccess} />
      </>
    )

    expect(googleIdentity.initialize).toHaveBeenCalledTimes(1)
    expect(googleIdentity.renderButton).toHaveBeenCalledTimes(2)

    const firstState = renderedButtonState(googleIdentity.renderButton, 0)
    const secondState = renderedButtonState(googleIdentity.renderButton, 1)
    expect(firstState).toBeTruthy()
    expect(secondState).toBeTruthy()
    expect(firstState).not.toBe(secondState)

    act(() => googleIdentity.respond({ credential: 'first-token', state: firstState }))
    expect(firstOnSuccess).toHaveBeenCalledWith(expect.objectContaining({ credential: 'first-token' }))
    expect(secondOnSuccess).not.toHaveBeenCalled()

    act(() => googleIdentity.respond({ credential: 'second-token', state: secondState }))
    expect(secondOnSuccess).toHaveBeenCalledWith(expect.objectContaining({ credential: 'second-token' }))
  })

  it('keeps callback routing intact through StrictMode setup and cleanup', () => {
    const googleIdentity = installGoogleIdentity()
    const onSuccess = vi.fn()

    render(
      <StrictMode>
        <GoogleSignInButton clientId="client-id" onSuccess={onSuccess} />
      </StrictMode>
    )

    const latestCall = googleIdentity.renderButton.mock.calls.length - 1
    const buttonState = renderedButtonState(googleIdentity.renderButton, latestCall)

    act(() => googleIdentity.respond({ credential: 'token', state: buttonState }))
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('removes callback routing when the button unmounts', () => {
    const googleIdentity = installGoogleIdentity()
    const onSuccess = vi.fn()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const view = render(<GoogleSignInButton clientId="client-id" onSuccess={onSuccess} />)
    const buttonState = renderedButtonState(googleIdentity.renderButton, 0)

    view.unmount()
    act(() => googleIdentity.respond({ credential: 'stale-token', state: buttonState }))

    expect(onSuccess).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith('Unable to match the Google credential response to the button that initiated it.')
  })

  it('waits for Google Identity Services to become available', () => {
    vi.useFakeTimers()
    const onSuccess = vi.fn()
    render(<GoogleSignInButton clientId="client-id" onSuccess={onSuccess} />)

    const googleIdentity = installGoogleIdentity()
    act(() => vi.advanceTimersByTime(50))

    expect(googleIdentity.initialize).toHaveBeenCalledTimes(1)
    expect(googleIdentity.renderButton).toHaveBeenCalledTimes(1)
  })

  it('keeps the Google iframe hidden until it has loaded', () => {
    vi.useFakeTimers()
    installGoogleIdentity()
    const view = render(<GoogleSignInButton clientId="client-id" onSuccess={vi.fn()} />)
    const iframe = view.container.querySelector('iframe')
    const buttonContainer = iframe?.parentElement

    expect(iframe).not.toBeNull()
    expect(buttonContainer?.style.visibility).toBe('hidden')
    expect(view.getByRole('status').textContent).toBe('Loading Google sign-in')

    act(() => {
      iframe?.dispatchEvent(new Event('load'))
      vi.advanceTimersByTime(600)
    })

    expect(buttonContainer?.style.visibility).toBe('visible')
    expect(view.queryByRole('status')).toBeNull()
  })

  it('replaces and cleans the reveal timer when GIS replaces its iframe', async () => {
    vi.useFakeTimers()
    installGoogleIdentity()
    const view = render(<GoogleSignInButton clientId="client-id" onSuccess={vi.fn()} />)
    const firstIframe = view.container.querySelector('iframe')
    const buttonContainer = firstIframe?.parentElement

    act(() => firstIframe?.dispatchEvent(new Event('load')))
    expect(vi.getTimerCount()).toBe(1)

    const replacementIframe = document.createElement('iframe')
    replacementIframe.src = 'https://accounts.google.com/gsi/button'
    await act(async () => {
      buttonContainer?.replaceChildren(replacementIframe)
      await Promise.resolve()
    })
    act(() => replacementIframe.dispatchEvent(new Event('load')))

    expect(vi.getTimerCount()).toBe(1)
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects multiple client IDs for one Google Identity Services instance', () => {
    const googleIdentity = installGoogleIdentity()
    const secondOnError = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <>
        <GoogleSignInButton clientId="first-client" onSuccess={vi.fn()} />
        <GoogleSignInButton clientId="second-client" onSuccess={vi.fn()} onError={secondOnError} />
      </>
    )

    expect(googleIdentity.renderButton).toHaveBeenCalledTimes(1)
    expect(secondOnError).toHaveBeenCalledTimes(1)
  })
})

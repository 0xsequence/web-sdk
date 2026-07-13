import type { CredentialResponse } from '@react-oauth/google'
import { act, cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocalStorageKey } from '../../constants/localStorage.js'
import type { ExtendedConnector } from '../../types.js'

import { GoogleWaasConnectButton } from './ConnectButton.js'

interface MockGoogleButtonProps {
  clientId: string
  width?: string
  type?: 'standard' | 'icon'
  theme?: string
  onSuccess: (response: CredentialResponse) => void
}

const mocks = vi.hoisted(() => ({
  googleButtonProps: undefined as MockGoogleButtonProps | undefined,
  setItem: vi.fn()
}))

vi.mock('@0xsequence/design-system', () => {
  const Passthrough = ({ children }: { children?: ReactNode }) => <>{children}</>
  return {
    Card: Passthrough,
    ContextMenuIcon: () => null,
    Text: Passthrough,
    Tooltip: Passthrough,
    useTheme: () => ({ theme: 'dark' })
  }
})

vi.mock('react-apple-signin-auth', () => ({
  default: () => null,
  appleAuthHelpers: {}
}))

vi.mock('../../connectors/X/XAuth.js', () => ({ getXIdToken: vi.fn() }))
vi.mock('../../hooks/useStorage.js', () => ({
  useStorage: () => ({ setItem: mocks.setItem }),
  useStorageItem: () => ({ data: undefined })
}))
vi.mock('../GoogleSignInButton/GoogleSignInButton.js', () => ({
  GoogleSignInButton: (props: MockGoogleButtonProps) => {
    mocks.googleButtonProps = props
    return <div data-testid="google-button" />
  }
}))

const connector = {
  uid: 'google-waas',
  params: { googleClientId: 'google-client-id' },
  _wallet: { id: 'google-waas' }
} as unknown as ExtendedConnector

let availableWidth = 358
let resizeCallback: ResizeObserverCallback | undefined
const disconnectSpy = vi.fn()

beforeEach(() => {
  availableWidth = 358
  resizeCallback = undefined
  mocks.googleButtonProps = undefined
  mocks.setItem.mockReset()
  disconnectSpy.mockReset()

  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => availableWidth)
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }
      observe() {}
      disconnect() {
        disconnectSpy()
      }
    }
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('GoogleWaasConnectButton', () => {
  it('stores the credential before connecting', () => {
    const onConnect = vi.fn()
    render(<GoogleWaasConnectButton connector={connector} onConnect={onConnect} />)

    act(() => mocks.googleButtonProps?.onSuccess({ credential: 'google-token' }))

    expect(mocks.setItem).toHaveBeenCalledWith(LocalStorageKey.WaasGoogleIdToken, 'google-token')
    expect(onConnect).toHaveBeenCalledWith(connector)
    expect(mocks.setItem.mock.invocationCallOrder[0]).toBeLessThan(onConnect.mock.invocationCallOrder[0])
  })

  it('does not connect without a credential or after unmount', () => {
    const onConnect = vi.fn()
    const view = render(<GoogleWaasConnectButton connector={connector} onConnect={onConnect} />)
    const onSuccess = mocks.googleButtonProps?.onSuccess

    act(() => onSuccess?.({}))
    view.unmount()
    act(() => onSuccess?.({ credential: 'stale-token' }))

    expect(mocks.setItem).not.toHaveBeenCalled()
    expect(onConnect).not.toHaveBeenCalled()
  })

  it('updates the official button variant as its container resizes', () => {
    const view = render(<GoogleWaasConnectButton connector={connector} onConnect={vi.fn()} />)

    expect(mocks.googleButtonProps).toEqual(
      expect.objectContaining({ clientId: 'google-client-id', type: 'standard', width: '358', theme: 'outline_dark' })
    )

    availableWidth = 200
    act(() => resizeCallback?.([], {} as ResizeObserver))
    expect(mocks.googleButtonProps).toEqual(expect.objectContaining({ type: 'icon', width: undefined }))

    availableWidth = 500
    act(() => resizeCallback?.([], {} as ResizeObserver))
    expect(mocks.googleButtonProps).toEqual(expect.objectContaining({ type: 'standard', width: '400' }))

    view.unmount()
    expect(disconnectSpy).toHaveBeenCalledTimes(1)
  })
})

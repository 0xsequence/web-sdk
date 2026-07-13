import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ExtendedConnector } from '../../types.js'

import { SocialConnectorsSection, type SocialConnectorButtonOptions } from './SocialConnectorsSection.js'

vi.mock('@0xsequence/design-system', () => ({
  Divider: ({ className }: { className?: string }) => <hr className={className} />
}))

vi.mock('../ConnectButton/index.js', () => ({
  ShowAllWalletsButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>Show more</button>
}))

const connector = (id: string) =>
  ({
    uid: id,
    _wallet: { id }
  }) as ExtendedConnector

const createConnectorRenderer = () =>
  vi.fn((item: ExtendedConnector, options: SocialConnectorButtonOptions) => (
    <div data-testid={`connector-${item._wallet.id}`} data-options={JSON.stringify(options)} />
  ))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('SocialConnectorsSection', () => {
  it('preserves the compact row and show-more slot when Google is absent', () => {
    const renderConnector = createConnectorRenderer()
    const onShowMore = vi.fn()
    const connectors = ['one', 'two', 'three', 'four', 'five'].map(connector)
    const view = render(
      <SocialConnectorsSection
        connectors={connectors}
        descriptive={false}
        onShowMore={onShowMore}
        renderConnector={renderConnector}
      />
    )

    expect(renderConnector.mock.calls.map(([item]) => item._wallet.id)).toEqual(['one', 'two', 'three'])
    fireEvent.click(view.getByRole('button', { name: 'Show more' }))
    expect(onShowMore).toHaveBeenCalledTimes(1)
  })

  it('renders Google separately without displacing the compact connector row', () => {
    const renderConnector = createConnectorRenderer()
    const connectors = ['guest-waas', 'google-waas', 'apple-waas', 'epic-waas', 'X-waas'].map(connector)
    render(
      <SocialConnectorsSection
        connectors={connectors}
        descriptive={false}
        onShowMore={vi.fn()}
        renderConnector={renderConnector}
      />
    )

    expect(renderConnector.mock.calls.map(([item]) => item._wallet.id)).toEqual(['guest-waas', 'apple-waas', 'google-waas'])
    expect(renderConnector).toHaveBeenLastCalledWith(
      connectors[1],
      expect.objectContaining({ isDescriptive: true, googleButtonTheme: 'outline' })
    )
  })

  it('uses the filled Google button and keeps every connector in descriptive mode', () => {
    const renderConnector = createConnectorRenderer()
    const connectors = ['guest-waas', 'google-waas', 'apple-waas', 'epic-waas', 'X-waas'].map(connector)
    render(<SocialConnectorsSection connectors={connectors} descriptive onShowMore={vi.fn()} renderConnector={renderConnector} />)

    expect(renderConnector).toHaveBeenCalledWith(
      connectors[1],
      expect.objectContaining({ isDescriptive: true, googleButtonTheme: 'filled_blue' })
    )
    expect(renderConnector.mock.calls.map(([item]) => item._wallet.id).sort()).toEqual(
      connectors.map(item => item._wallet.id).sort()
    )
  })
})

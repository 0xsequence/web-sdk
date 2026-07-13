import { Divider } from '@0xsequence/design-system'
import type { ReactNode } from 'react'

import type { ExtendedConnector } from '../../types.js'
import { ShowAllWalletsButton } from '../ConnectButton/index.js'

const MAX_ITEMS_PER_ROW = 4
const GOOGLE_WAAS_CONNECTOR_ID = 'google-waas'

export interface SocialConnectorButtonOptions {
  isDescriptive: boolean
  googleButtonTheme?: 'filled_blue' | 'outline'
}

interface SocialConnectorsSectionProps {
  connectors: ExtendedConnector[]
  descriptive: boolean
  onShowMore: () => void
  renderConnector: (connector: ExtendedConnector, options: SocialConnectorButtonOptions) => ReactNode
}

export const isGoogleWaasConnector = (connector: ExtendedConnector) => connector._wallet?.id === GOOGLE_WAAS_CONNECTOR_ID

export const SocialConnectorsSection = ({
  connectors,
  descriptive,
  onShowMore,
  renderConnector
}: SocialConnectorsSectionProps) => {
  const hasMoreConnectors = connectors.length > MAX_ITEMS_PER_ROW
  const visibleConnectorCount = hasMoreConnectors && !descriptive ? MAX_ITEMS_PER_ROW - 1 : connectors.length
  const visibleConnectors = connectors.slice(0, visibleConnectorCount)
  const googleConnector = connectors.find(isGoogleWaasConnector)
  const otherConnectors = visibleConnectors.filter(connector => !isGoogleWaasConnector(connector))

  const renderConnectorGroup = (groupConnectors: ExtendedConnector[]) => (
    <div className={`flex gap-2 justify-center items-center ${descriptive ? 'flex-col' : 'flex-row'}`}>
      {groupConnectors.map(connector => (
        <div className="w-full" key={connector.uid}>
          {renderConnector(connector, { isDescriptive: descriptive })}
        </div>
      ))}
      {hasMoreConnectors && (
        <div className="w-full">
          <ShowAllWalletsButton onClick={onShowMore} />
        </div>
      )}
    </div>
  )

  if (!googleConnector) {
    return renderConnectorGroup(visibleConnectors)
  }

  if (descriptive) {
    return (
      <div className="flex w-full flex-col gap-3">
        <Divider className="mx-0 my-0 text-background-secondary w-full" />
        <div className="rounded-xl border border-border-card bg-background-secondary p-2">
          {renderConnector(googleConnector, {
            isDescriptive: true,
            googleButtonTheme: 'filled_blue'
          })}
        </div>
        <Divider className="mx-0 my-0 text-background-secondary w-full" />
        {renderConnectorGroup(otherConnectors)}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {renderConnectorGroup(otherConnectors)}
      <Divider className="mx-0 my-0 text-background-secondary w-full" />
      {renderConnector(googleConnector, {
        isDescriptive: true,
        googleButtonTheme: 'outline'
      })}
    </div>
  )
}

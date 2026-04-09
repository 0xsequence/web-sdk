import { Text } from '@0xsequence/design-system'

import { PolygonLogo } from './PolygonLogo.js'

export const PoweredByPolygon = () => {
  return (
    <div
      className="powered-by-polygon-footer flex relative gap-1 flex-row items-center justify-center select-none cursor-pointer"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.open('https://polygon.technology')
        }
      }}
    >
      <Text variant="xsmall" color="muted" fontWeight="bold">
        Powered by
      </Text>
      <div className="h-auto flex-none" style={{ width: 56, marginTop: 2 }}>
        <PolygonLogo />
      </div>
    </div>
  )
}

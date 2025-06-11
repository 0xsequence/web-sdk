import { Switch, Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { ListCard } from '../../components/ListCard/ListCard.js'
import { useSettings } from '../../hooks/index.js'

export const SettingsPreferences = () => {
  const { hideUnlistedTokensObservable, setHideUnlistedTokens } = useSettings()
  const hideUnlistedTokens = useObservable(hideUnlistedTokensObservable)

  return (
    <div className="px-4 pb-4">
      <ListCard
        isSelected={hideUnlistedTokens}
        rightChildren={<Switch checked={hideUnlistedTokens} />}
        onClick={() => setHideUnlistedTokens(!hideUnlistedTokens)}
      >
        <Text color="primary" fontWeight="medium" variant="normal">
          Hide Unlisted Tokens
        </Text>
      </ListCard>
    </div>
  )
}

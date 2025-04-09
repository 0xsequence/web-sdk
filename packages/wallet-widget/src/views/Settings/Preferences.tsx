import { Switch, Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { useSettings } from '../../hooks'

export const SettingsPreferences = () => {
  const { hideUnlistedTokensObservable, setHideUnlistedTokens } = useSettings()
  const hideUnlistedTokens = useObservable(hideUnlistedTokensObservable)

  return (
    <div className="p-4">
      <ListCardSelect
        isSelected={hideUnlistedTokens}
        rightChildren={<Switch checked={hideUnlistedTokens} />}
        type="custom"
        onClick={() => setHideUnlistedTokens(!hideUnlistedTokens)}
      >
        <Text color="primary" fontWeight="medium" variant="normal">
          Hide Unlisted Tokens
        </Text>
      </ListCardSelect>
    </div>
  )
}

import { Switch, Text } from '@0xsequence/design-system'
import { useObservable } from 'micro-observables'

import { ListCardSelect } from '../../components/ListCard/ListCardSelect'
import { HEADER_HEIGHT } from '../../constants'
import { useSettings } from '../../hooks'

export const SettingsPreferences = () => {
  const { hideUnlistedTokensObservable, setHideUnlistedTokens } = useSettings()
  const hideUnlistedTokens = useObservable(hideUnlistedTokensObservable)

  return (
    <div className="px-4 pb-4" style={{ paddingTop: HEADER_HEIGHT }}>
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

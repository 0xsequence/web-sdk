import { OptionsFooter } from '../../components/OptionsFooter.js'
import { useNavigation } from '../../hooks/index.js'

export const SettingsApps = () => {
  const { setNavigation } = useNavigation()
  const onClickConnectApp = () => {
    setNavigation({ location: 'connect-dapp' })
  }
  return (
    <div className="flex flex-col px-4 pb-4 gap-2">
      <OptionsFooter primaryButtonText="+ Connect an App" onPrimaryButtonClick={onClickConnectApp} />
    </div>
  )
}

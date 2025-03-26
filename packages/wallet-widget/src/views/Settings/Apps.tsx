import { OptionsFooter } from '../../components/OptionsFooter'
import { useNavigation } from '../../hooks/useNavigation'

export const SettingsApps = () => {
  const { setNavigation } = useNavigation()
  const onClickConnectApp = () => {
    setNavigation({ location: 'connect-dapp' })
  }
  return (
    <div className="flex flex-col pb-5 px-4 pt-3 gap-2">
      <OptionsFooter primaryButtonText="+ Connect an App" onPrimaryButtonClick={onClickConnectApp} />
    </div>
  )
}

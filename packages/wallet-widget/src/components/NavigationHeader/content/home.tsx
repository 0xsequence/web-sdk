import { Divider, IconButton, SearchIcon, SettingsIcon, SwapIcon, WalletIcon } from '@0xsequence/design-system'

export const Home = () => {
  return (
    <div className="flex flex-col justify-between h-full w-full" style={{ position: 'relative' }}>
      <div className="flex flex-row items-start p-4 gap-3">
        <IconButton className="bg-background-secondary" icon={WalletIcon} size="sm" />
        <IconButton className="bg-background-secondary" icon={SwapIcon} size="sm" />
        <IconButton className="bg-background-secondary" icon={SearchIcon} size="sm" />
        <IconButton className="bg-background-secondary" icon={SettingsIcon} size="sm" />
      </div>
      <Divider className="my-0 w-full" style={{ position: 'absolute', bottom: 0 }} />
    </div>
  )
}

import { TextInput } from '@0xsequence/design-system'

export const SearchHeader = () => {
  return (
    <div className="grow px-4">
      <TextInput autoFocus placeholder="Search" name={'Search Wallet'} />
    </div>
  )
}

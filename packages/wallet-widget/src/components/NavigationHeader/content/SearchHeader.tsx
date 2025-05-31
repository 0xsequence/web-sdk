import { TextInput } from '@0xsequence/design-system'

import { useNavigationHeader } from '../../../hooks/useNavigationHeader.js'

export const SearchHeader = () => {
  const { search, setSearch } = useNavigationHeader()
  return (
    <div className="grow px-4">
      <TextInput autoFocus placeholder="Search" name={'Search Wallet'} value={search} onChange={e => setSearch(e.target.value)} />
    </div>
  )
}

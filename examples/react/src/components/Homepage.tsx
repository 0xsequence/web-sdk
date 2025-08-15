import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { Button, Image } from '@0xsequence/design-system'
import { Footer } from 'example-shared-components'

import { PERMISSION_TYPE_LOCAL_STORAGE_KEY, PermissionsType } from '../constants/permissions'
import { useLocalState } from '../hooks/useLocalState'

import { Connected } from './Connected'

export const Homepage = () => {
  const { wallets } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  const [initialPermissionsType, setInitialPermissionsType] = useLocalState<PermissionsType>(
    PERMISSION_TYPE_LOCAL_STORAGE_KEY,
    'none'
  )

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  return (
    <main>
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 h-screen">
          <div className="flex flex-row items-center justify-center gap-3">
            <Image className="w-[300px]" src="images/sequence-websdk-dark.svg" />
          </div>

          <div className="flex gap-2 flex-row items-center">
            <Button onClick={onClickConnect} variant="feature" label="Connect" />
          </div>

          {/* <div className="permissions-group">
            <label htmlFor="initial-permissions">Initial Session Permissions (Optional)</label>
            <select
              id="initial-permissions"
              value={initialPermissionsType}
              onChange={e => {
                setInitialPermissionsType(e.target.value as PermissionsType)
                window.location.reload()
              }}
            >
              <option value="none">None (Implicit Signer Only)</option>
              <option value="contractCall">1. Contract call for explicitEmit()</option>
              <option value="usdcTransfer">2. USDC Transfer (Optimism only)</option>
              <option value="combined">3. Combined (1. + 2.)</option>
            </select>
          </div> */}
        </div>
      ) : (
        <Connected />
      )}
      <Footer />
    </main>
  )
}

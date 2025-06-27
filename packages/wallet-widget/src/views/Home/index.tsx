import { truncateAtIndex, useSocialLink, useWallets } from '@0xsequence/connect'
import { Text } from '@0xsequence/design-system'
import { useAccount } from 'wagmi'

import { CopyButton } from '../../components/CopyButton.js'
import { GeneralList } from '../../components/SearchLists/index.js'
import { WalletAccountGradient } from '../../components/WalletAccountGradient.js'
import { useSettings, useValueRegistry } from '../../hooks/index.js'
import { useShared } from '../../hooks/useShared.js'

export const Home = () => {
  const { isGuest, signInDisplay } = useShared()
  const { wallets: allWallets } = useWallets()
  const { fiatCurrency } = useSettings()
  const { totalValue } = useValueRegistry()
  const { setIsSocialLinkOpen } = useSocialLink()
  const { address: accountAddress } = useAccount()

  const onClickLinkGuestAccount = () => {
    setIsSocialLinkOpen(true)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center w-full px-4">
        <div className="flex flew-row justify-between items-center w-full py-4 gap-4">
          {allWallets.length > 1 ? (
            <WalletAccountGradient accountAddresses={allWallets.map(wallet => wallet.address)} />
          ) : (
            <div className="flex flex-row items-center w-full gap-2">
              <WalletAccountGradient accountAddresses={allWallets.map(wallet => wallet.address)} />
              <div className="flex flex-col">
                <div className="flex flex-row gap-1 items-center">
                  <Text color="primary" fontWeight="medium" variant="normal">
                    {truncateAtIndex(accountAddress || '', 8)}
                  </Text>
                  <CopyButton text={accountAddress || ''} />
                </div>
                {signInDisplay && (
                  <Text color="muted" fontWeight="medium" variant="small">
                    {signInDisplay}
                  </Text>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-end">
            <Text color="muted" variant="small">
              Balance
            </Text>
            <Text color="primary" variant="xlarge" nowrap>
              {fiatCurrency.symbol} {fiatCurrency.sign}
              {totalValue}
            </Text>
          </div>
        </div>
        {isGuest && (
          <Text
            className="cursor-pointer hover:opacity-80 w-full"
            color="warning"
            variant="medium"
            nowrap
            onClick={() => {
              onClickLinkGuestAccount()
            }}
          >
            Click here to link your guest account
          </Text>
        )}
      </div>

      <div className="w-full relative">
        <GeneralList variant="default" />
      </div>
    </div>
  )
}

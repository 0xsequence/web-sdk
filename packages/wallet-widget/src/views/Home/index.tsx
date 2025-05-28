import { useAddFundsModal } from '@0xsequence/checkout'
import {
  compareAddress,
  getNativeTokenInfoByChainId,
  truncateAtIndex,
  useOpenConnectModal,
  useWallets
} from '@0xsequence/connect'
import {
  AddIcon,
  ArrowUpIcon,
  Button,
  ChevronUpDownIcon,
  Divider,
  EllipsisIcon,
  ScanIcon,
  Skeleton,
  SwapIcon,
  TabsContent,
  TabsPrimitive,
  Text
} from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate } from '@0xsequence/hooks'
import { ethers } from 'ethers'
import { useObservable } from 'micro-observables'
import { AnimatePresence } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { CopyButton } from '../../components/CopyButton.js'
import { WalletsFilter } from '../../components/Filter/WalletsFilter.js'
import { StackedIconTag } from '../../components/IconWrappers/StackedIconTag.js'
import { ListCardNav } from '../../components/ListCard/ListCardNav.js'
import { ListCardNavTable } from '../../components/ListCardTable/ListCardNavTable.js'
import { GeneralList } from '../../components/SearchLists/index.js'
import { SelectWalletRow } from '../../components/Select/SelectWalletRow.js'
import { SlideupDrawer } from '../../components/Select/SlideupDrawer.js'
import { WalletAccountGradient } from '../../components/WalletAccountGradient.js'
import { useFiatWalletsMap, useGetAllTokensDetails, useNavigation, useSettings } from '../../hooks/index.js'
import { computeBalanceFiat } from '../../utils/index.js'

import { OperationButtonTemplate } from './OperationButtonTemplate.js'

export const Home = () => {
  const { setNavigation } = useNavigation()
  const { selectedWalletsObservable, selectedNetworks, hideUnlistedTokens, fiatCurrency } = useSettings()
  const { fiatWalletsMap } = useFiatWalletsMap()
  const { connector } = useAccount()

  const selectedWallets = useObservable(selectedWalletsObservable)
  const { chains } = useConfig()
  const { address: accountAddress } = useAccount()
  const { wallets, setActiveWallet } = useWallets()

  const { setOpenConnectModal } = useOpenConnectModal()
  const { triggerAddFunds } = useAddFundsModal()
  const [accountSelectorModalOpen, setAccountSelectorModalOpen] = useState(false)
  const [walletFilterOpen, setWalletFilterOpen] = useState(false)

  const [signInDisplay, setSignInDisplay] = useState('')

  useEffect(() => {
    const fetchSignInDisplay = async () => {
      const sequenceWaas = (await connector?.sequenceWaas) as {
        listAccounts: () => Promise<{ accounts: { email: string; type: string }[] }>
      }

      if (sequenceWaas) {
        const sequenceWaasAccounts = await sequenceWaas.listAccounts()
        const waasEmail = sequenceWaasAccounts.accounts.find(account => account.type === 'OIDC')?.email
        let backupEmail = ''
        if (sequenceWaasAccounts.accounts.length > 0) {
          backupEmail = sequenceWaasAccounts.accounts[0].email
        }
        setSignInDisplay(waasEmail || backupEmail)
      } else {
        setSignInDisplay(connector?.name || '')
      }
    }
    fetchSignInDisplay()
  }, [connector])

  const totalFiatValue = fiatWalletsMap
    .reduce((acc, wallet) => {
      if (selectedWallets.some(selectedWallet => selectedWallet.address === wallet.accountAddress)) {
        const walletFiatValue = Number(wallet.fiatValue)
        return acc + walletFiatValue
      }
      return acc
    }, 0)
    .toFixed(2)

  const onClickAccountSelector = () => {
    setAccountSelectorModalOpen(true)
  }
  const handleAddNewWallet = () => {
    setAccountSelectorModalOpen(false)
    setOpenConnectModal(true)
  }
  const onClickSend = () => {
    setNavigation({
      location: 'send-general'
    })
  }
  const onClickSwap = () => {
    setNavigation({
      location: 'swap'
    })
  }
  const onClickReceive = () => {
    setNavigation({
      location: 'receive'
    })
  }
  const onClickAddFunds = () => {
    triggerAddFunds({ walletAddress: accountAddress || '' })
  }
  const onClickWalletSelector = () => {
    setWalletFilterOpen(true)
  }
  // const onClickTokens = () => {
  //   setNavigation({
  //     location: 'search-tokens'
  //   })
  // }
  // const onClickCollectibles = () => {
  //   setNavigation({
  //     location: 'search-collectibles'
  //   })
  // }
  const onClickTransactions = () => {
    setNavigation({
      location: 'history'
    })
  }
  const onClickSettings = () => {
    setNavigation({
      location: 'settings'
    })
  }

  // const homeNavTableItems = [
  //   <ListCardNav
  //     onClick={onClickTokens}
  //     rightChildren={
  //       coinBalances.length > 0 ? (
  //         <div className="flex flex-row gap-1 items-center">
  //           <Text className="flex flex-row items-center" color="muted" fontWeight="medium" variant="normal">
  //             {fiatCurrency.sign}
  //             {isLoading ? <Skeleton className="w-4 h-4" /> : `${totalFiatValue}`}
  //           </Text>
  //           <StackedIconTag
  //             iconList={coinBalancesIcons}
  //             onClick={onClickWalletSelector}
  //             label={
  //               <Text color="muted" fontWeight="medium" variant="normal">
  //                 {coinBalances.length}
  //               </Text>
  //             }
  //           />
  //         </div>
  //       ) : (
  //         <Text color="muted" fontWeight="medium" variant="normal" nowrap>
  //           No Tokens
  //         </Text>
  //       )
  //     }
  //     shape="square"
  //   >
  //     <Text color="primary" fontWeight="medium" variant="normal">
  //       Tokens
  //     </Text>
  //   </ListCardNav>,
  //   <ListCardNav
  //     onClick={onClickCollectibles}
  //     rightChildren={
  //       collectibleBalances.length > 0 ? (
  //         <StackedIconTag
  //           iconList={collectibleBalancesIcons}
  //           onClick={onClickWalletSelector}
  //           label={
  //             <Text color="muted" fontWeight="medium" variant="normal">
  //               {collectibleBalances.length}
  //             </Text>
  //           }
  //           shape="square"
  //         />
  //       ) : (
  //         <Text color="muted" fontWeight="medium" variant="normal" nowrap>
  //           No Collectibles
  //         </Text>
  //       )
  //     }
  //     shape="square"
  //   >
  //     <Text color="primary" fontWeight="medium" variant="normal">
  //       Collectibles
  //     </Text>
  //   </ListCardNav>
  // ]

  return (
    <div className="flex flex-col items-center h-full">
      <div className="flex flex-col items-center w-full px-4">
        <div className="flex flew-row justify-between items-center w-full py-4">
          <div className="flex flex-row items-center w-full gap-2">
            <WalletAccountGradient accountAddress={accountAddress || ''} />
            <div className="flex flex-col">
              <div className="flex flex-row gap-1 items-center">
                <Text color="primary" fontWeight="medium" variant="normal">
                  {truncateAtIndex(accountAddress || '', 8)}
                </Text>
                <CopyButton text={accountAddress || ''} buttonVariant="icon" />
              </div>
              {signInDisplay && (
                <Text color="muted" fontWeight="medium" variant="small">
                  {signInDisplay}
                </Text>
              )}
            </div>
            <Button variant="text" onClick={onClickAccountSelector}>
              <ChevronUpDownIcon color="white" />
            </Button>
          </div>
          <div className="flex flex-col items-end">
            <Text color="muted" variant="small">
              Balance
            </Text>
            <Text color="primary" variant="xlarge" nowrap>
              {fiatCurrency.symbol} {fiatCurrency.sign}
              {totalFiatValue}
            </Text>
          </div>
        </div>
      </div>

      <GeneralList variant="default" />

      {/* <div className="flex flex-row gap-2 w-full mt-3">
        <OperationButtonTemplate label="Send" onClick={onClickSend} icon={ArrowUpIcon} />
        <OperationButtonTemplate label="Swap" onClick={onClickSwap} icon={SwapIcon} />
        <OperationButtonTemplate label="Receive" onClick={onClickReceive} icon={ScanIcon} />
        <OperationButtonTemplate label="Buy" onClick={onClickAddFunds} icon={AddIcon} />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <ListCardNavTable navItems={homeNavTableItems}>
          <>
            <Text color="primary" fontWeight="bold" variant="normal">
              Items
            </Text>
            <StackedIconTag
              iconList={selectedWallets.map(wallet => wallet.address)}
              label={
                <div className="flex flex-row items-center" style={{ gap: '3px' }}>
                  <Text color="primary" variant="normal" fontWeight="medium">
                    {`${selectedWallets.length} Wallet${selectedWallets.length === 1 ? '' : 's'}`}
                  </Text>
                  <EllipsisIcon color="white" />
                </div>
              }
              isAccount
              enabled
              onClick={onClickWalletSelector}
            />
          </>
        </ListCardNavTable>
        <ListCardNav onClick={onClickTransactions}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Transactions
          </Text>
        </ListCardNav>
        <ListCardNav onClick={onClickSettings}>
          <Text color="primary" fontWeight="medium" variant="normal">
            Settings
          </Text>
        </ListCardNav>
      </div> */}

      <AnimatePresence>
        {accountSelectorModalOpen && (
          <SlideupDrawer
            onClose={() => setAccountSelectorModalOpen(false)}
            label="Select main wallet"
            buttonLabel="+ Add new wallet"
            handleButtonPress={handleAddNewWallet}
            dragHandleWidth={74}
          >
            <div className="flex flex-col gap-2 bg-background-primary">
              {wallets.map((wallet, index) => (
                <SelectWalletRow
                  key={index}
                  wallet={wallet}
                  onClose={() => setAccountSelectorModalOpen(false)}
                  onClick={setActiveWallet}
                />
              ))}
            </div>
          </SlideupDrawer>
        )}
        {walletFilterOpen && (
          <SlideupDrawer onClose={() => setWalletFilterOpen(false)} label="Filter items by wallet">
            <WalletsFilter />
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}

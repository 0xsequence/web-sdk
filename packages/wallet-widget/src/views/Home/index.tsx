import { useAddFundsModal } from '@0xsequence/checkout'
import { compareAddress, formatAddress, useWallets, useOpenConnectModal, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import {
  Button,
  ArrowUpIcon,
  SwapIcon,
  ScanIcon,
  AddIcon,
  ChevronUpDownIcon,
  Text,
  EllipsisIcon,
  Skeleton
} from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate } from '@0xsequence/hooks'
import { ethers } from 'ethers'
import { useObservable } from 'micro-observables'
import { AnimatePresence } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'

import { CopyButton } from '../../components/CopyButton'
import { WalletsFilter } from '../../components/Filter/WalletsFilter'
import { StackedIconTag } from '../../components/IconWrappers/StackedIconTag'
import { ListCardNav } from '../../components/ListCard/ListCardNav'
import { ListCardNavTable } from '../../components/ListCardTable/ListCardNavTable'
import { SelectWalletRow } from '../../components/Select/SelectWalletRow'
import { SlideupDrawer } from '../../components/Select/SlideupDrawer'
import { WalletAccountGradient } from '../../components/WalletAccountGradient'
import { useNavigation, useSettings, useGetAllTokensDetails, useFiatWalletsMap } from '../../hooks'
import { computeBalanceFiat } from '../../utils'

import { OperationButtonTemplate } from './OperationButtonTemplate'

export const Home = () => {
  const { setNavigation } = useNavigation()
  const { selectedWalletsObservable, selectedNetworks, hideUnlistedTokens, fiatCurrency, selectedCollections } = useSettings()
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

  const { data: tokenBalancesData, isLoading: isLoadingTokenBalances } = useGetAllTokensDetails({
    accountAddresses: [accountAddress || ''],
    chainIds: selectedNetworks,
    contractWhitelist: selectedCollections.map(collection => collection.contractAddress),
    hideUnlistedTokens
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.ZeroAddress)) || []

  const isSingleCollectionSelected = selectedCollections.length === 1

  const collectibleBalancesUnordered =
    tokenBalancesData?.filter(token => {
      if (token.contractType !== 'ERC721' && token.contractType !== 'ERC1155') {
        return false
      }
      if (isSingleCollectionSelected) {
        return token.chainId === selectedCollections[0].chainId
      }
      return true
    }) || []

  const { data: coinPrices = [], isLoading: isLoadingCoinPrices } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate, isLoading: isLoadingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

  const isLoading = isLoadingTokenBalances || isLoadingCoinPrices || isLoadingConversionRate

  const totalFiatValue = fiatWalletsMap
    .reduce((acc, wallet) => {
      if (selectedWallets.some(selectedWallet => selectedWallet.address === wallet.accountAddress)) {
        const walletFiatValue = Number(wallet.fiatValue)
        return acc + walletFiatValue
      }
      return acc
    }, 0)
    .toFixed(2)

  const coinBalances = coinBalancesUnordered.sort((a, b) => {
    const isHigherFiat =
      Number(
        computeBalanceFiat({
          balance: b,
          prices: coinPrices,
          conversionRate: conversionRate || 1,
          decimals: b.contractInfo?.decimals || 18
        })
      ) -
      Number(
        computeBalanceFiat({
          balance: a,
          prices: coinPrices,
          conversionRate: conversionRate || 1,
          decimals: a.contractInfo?.decimals || 18
        })
      )
    return isHigherFiat
  })

  const collectibleBalances = collectibleBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const coinBalancesIconSet = new Set()
  const coinBalancesIcons = useMemo(
    () =>
      coinBalances
        .map(coin => {
          const isNativeToken = compareAddress(coin.contractAddress, ethers.ZeroAddress)
          const nativeTokenInfo = getNativeTokenInfoByChainId(coin.chainId, chains)
          const logoURI = isNativeToken ? nativeTokenInfo.logoURI : coin.contractInfo?.logoURI
          const tokenName = isNativeToken ? nativeTokenInfo.name : coin.contractInfo?.name

          if (coinBalancesIconSet.has(tokenName) || !logoURI) {
            return
          }

          coinBalancesIconSet.add(tokenName)
          if (coinBalancesIconSet.size <= 3) {
            return logoURI
          }
        })
        .filter(Boolean) as string[],
    [coinBalances, selectedWallets, selectedNetworks, hideUnlistedTokens, selectedCollections]
  )

  const collectibleBalancesIconSet = new Set()
  const collectibleBalancesIcons = useMemo(
    () =>
      collectibleBalances
        .map(collectible => {
          const logoURI = collectible.tokenMetadata?.image

          if (collectibleBalancesIconSet.has(logoURI) || !logoURI) {
            return
          }

          collectibleBalancesIconSet.add(logoURI)
          if (collectibleBalancesIconSet.size <= 3) {
            return logoURI
          }
        })
        .filter(Boolean) as string[],
    [collectibleBalances, selectedWallets, selectedNetworks, hideUnlistedTokens, selectedCollections]
  )

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
  const onClickTokens = () => {
    setNavigation({
      location: 'search-tokens'
    })
  }
  const onClickCollectibles = () => {
    setNavigation({
      location: 'search-collectibles'
    })
  }
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

  const homeNavTableItems = [
    <ListCardNav
      onClick={onClickTokens}
      rightChildren={
        coinBalances.length > 0 ? (
          <div className="flex flex-row gap-1 items-center">
            <Text className="flex flex-row items-center" color="muted" fontWeight="medium" variant="normal">
              {fiatCurrency.sign}
              {isLoading ? <Skeleton className="w-4 h-4" /> : `${totalFiatValue}`}
            </Text>
            <StackedIconTag
              iconList={coinBalancesIcons}
              onClick={onClickWalletSelector}
              label={
                <Text color="muted" fontWeight="medium" variant="normal">
                  {coinBalances.length}
                </Text>
              }
            />
          </div>
        ) : (
          <Text color="muted" fontWeight="medium" variant="normal" nowrap>
            No Tokens
          </Text>
        )
      }
      shape="square"
    >
      <Text color="primary" fontWeight="medium" variant="normal">
        Tokens
      </Text>
    </ListCardNav>,
    <ListCardNav
      onClick={onClickCollectibles}
      rightChildren={
        collectibleBalances.length > 0 ? (
          <StackedIconTag
            iconList={collectibleBalancesIcons}
            onClick={onClickWalletSelector}
            label={
              <Text color="muted" fontWeight="medium" variant="normal">
                {collectibleBalances.length}
              </Text>
            }
            shape="square"
          />
        ) : (
          <Text color="muted" fontWeight="medium" variant="normal" nowrap>
            No Collectibles
          </Text>
        )
      }
      shape="square"
    >
      <Text color="primary" fontWeight="medium" variant="normal">
        Collectibles
      </Text>
    </ListCardNav>
  ]

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex flex-row gap-2 items-center">
        <WalletAccountGradient accountAddress={accountAddress || ''} />
        <div className="flex flex-col">
          <div className="flex flex-row gap-1 items-center">
            <Text color="primary" fontWeight="medium" variant="normal">
              {formatAddress(accountAddress || '')}
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
      <div className="flex flex-row gap-2 w-full mt-3">
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
      </div>

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
          <SlideupDrawer onClose={() => setWalletFilterOpen(false)} label="Select active wallet">
            <WalletsFilter />
          </SlideupDrawer>
        )}
      </AnimatePresence>
    </div>
  )
}

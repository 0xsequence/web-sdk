import { SwapModalSettings, useAddFundsModal, useSwapModal } from '@0xsequence/checkout'
import { compareAddress, formatAddress, useWallets, useOpenConnectModal, getNativeTokenInfoByChainId } from '@0xsequence/connect'
import {
  Button,
  SendIcon,
  SwapIcon,
  ScanIcon,
  AddIcon,
  ChevronDownIcon,
  Text,
  EllipsisIcon,
  Skeleton
} from '@0xsequence/design-system'
import { useGetCoinPrices, useGetExchangeRate, useGetTokenBalancesDetails } from '@0xsequence/hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { ethers } from 'ethers'
import { AnimatePresence } from 'motion/react'
import { useContext, useState } from 'react'
import { parseAbi } from 'viem'
import { encodeFunctionData } from 'viem'
import { useAccount, useConfig } from 'wagmi'

import { StackedIconTag } from '../../../../components/IconWrappers/StackedIconTag'
import { ListCardNav } from '../../../../components/ListCard/ListCardNav'
import { ListCardNavTable } from '../../../../components/ListCardTable/ListCardNavTable'
import { SelectWalletRow } from '../../../../components/SelectWalletRow'
import { SlideupDrawer } from '../../../../components/SlideupDrawer'
import { WalletAccountGradient } from '../../../../components/WalletAccountGradient'
import { useNavigation, useSettings } from '../../../../hooks'
import { computeBalanceFiat } from '../../../../utils'
import { getConnectorLogo } from '../../../../utils/wallets'
import { FilterMenu } from '../../../FilterMenu'

import { OperationButtonTemplate } from './Buttons/OperationButtonTemplate'

export const IntegratedWallet = () => {
  const { setNavigation } = useNavigation()
  const { selectedWallets, selectedNetworks, hideUnlistedTokens, fiatCurrency, selectedCollections } = useSettings()
  const { chains } = useConfig()
  const { address: accountAddress } = useAccount()
  const { wallets, setActiveWallet } = useWallets()

  const { setOpenConnectModal } = useOpenConnectModal()
  const { openSwapModal } = useSwapModal()
  const { triggerAddFunds } = useAddFundsModal()
  const [accountSelectorModalOpen, setAccountSelectorModalOpen] = useState(false)
  const [walletFilterOpen, setWalletFilterOpen] = useState(false)

  const { data: tokenBalancesData, isPending: isTokenBalancesPending } = useGetTokenBalancesDetails({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: selectedWallets.map(wallet => wallet.address),
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      contractWhitelist: selectedCollections.map(collection => collection.contractAddress),
      omitNativeBalances: false
    }
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.ZeroAddress)) || []

  const collectibleBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []

  const { data: coinPrices = [], isPending: isCoinPricesPending } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isConversionRatePending } = useGetExchangeRate(fiatCurrency.symbol)

  const isPending = isTokenBalancesPending || isCoinPricesPending || isConversionRatePending

  const totalCoinPrices = coinBalancesUnordered
    .reduce((acc, coin) => {
      return (
        acc +
        Number(
          computeBalanceFiat({
            balance: coin,
            prices: coinPrices,
            conversionRate,
            decimals: coin.contractInfo?.decimals || 18
          })
        )
      )
    }, 0)
    .toFixed(2)

  const coinBalances = coinBalancesUnordered.sort((a, b) => {
    const isHigherFiat =
      Number(
        computeBalanceFiat({
          balance: b,
          prices: coinPrices,
          conversionRate,
          decimals: b.contractInfo?.decimals || 18
        })
      ) -
      Number(
        computeBalanceFiat({
          balance: a,
          prices: coinPrices,
          conversionRate,
          decimals: a.contractInfo?.decimals || 18
        })
      )
    return isHigherFiat
  })

  const collectibleBalances = collectibleBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const coinBalancesIconSet = new Set()
  const coinBalancesIcons = coinBalances
    .map(coin => {
      const isNativeToken = compareAddress(coin.contractAddress, ethers.ZeroAddress)
      const nativeTokenInfo = getNativeTokenInfoByChainId(coin.chainId, chains)
      const logoURI = isNativeToken ? nativeTokenInfo.logoURI : coin.contractInfo?.logoURI
      const tokenName = isNativeToken ? nativeTokenInfo.name : coin.contractInfo?.name

      if (coinBalancesIconSet.has(tokenName)) {
        return
      }

      coinBalancesIconSet.add(tokenName)
      if (coinBalancesIconSet.size <= 3) {
        return logoURI
      }
    })
    .filter(Boolean) as string[]

  const collectibleBalancesIconSet = new Set()
  const collectibleBalancesIcons = collectibleBalances
    .map(collectible => {
      const logoURI = collectible.tokenMetadata?.image

      if (collectibleBalancesIconSet.has(logoURI)) {
        return
      }

      collectibleBalancesIconSet.add(logoURI)
      if (collectibleBalancesIconSet.size <= 3) {
        return logoURI
      }
    })
    .filter(Boolean) as string[]

  const collectibleBalancesAmount = collectibleBalances.length

  const onClickAccountSelector = () => {
    setAccountSelectorModalOpen(true)
  }
  const handleAddNewWallet = () => {
    setAccountSelectorModalOpen(false)
    setOpenConnectModal(true)
  }
  const onClickSend = () => {
    setNavigation({
      location: 'send'
    })
  }
  const onClickSwap = () => {
    setNavigation({
      location: 'swap'
    })
    // const chainId = 137
    // const currencyAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    // const currencyAmount = '20000'
    // const data = encodeFunctionData({ abi: parseAbi(['function demo()']), functionName: 'demo', args: [] })

    // const swapModalSettings: SwapModalSettings = {
    //   onSuccess: () => {
    //     console.log('swap successful!')
    //   },
    //   chainId,
    //   currencyAddress,
    //   currencyAmount,
    //   postSwapTransactions: [
    //     {
    //       to: '0x37470dac8a0255141745906c972e414b1409b470',
    //       data
    //     }
    //   ],
    //   title: 'Swap and Pay',
    //   description: 'Select a token in your wallet to swap to 0.2 USDC.'
    // }

    // openSwapModal(swapModalSettings)
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

  const activeWallet = wallets.find(wallet => wallet.isActive)
  const LoginIconComponent = getConnectorLogo(activeWallet?.signInMethod || '')

  const homeNavTableItems = [
    <ListCardNav
      onClick={onClickTokens}
      rightChildren={
        <div className="flex flex-row gap-1 items-center">
          <Text className="flex flex-row items-center" color="muted" fontWeight="medium" variant="normal">
            {fiatCurrency.sign}
            {isPending ? <Skeleton className="w-4 h-4" /> : `${totalCoinPrices}`}
          </Text>
          <StackedIconTag iconList={coinBalancesIcons} onClick={onClickWalletSelector} />
        </div>
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
        <StackedIconTag
          iconList={collectibleBalancesIcons}
          onClick={onClickWalletSelector}
          label={
            <Text color="muted" fontWeight="medium" variant="normal">
              {collectibleBalancesAmount}
            </Text>
          }
        />
      }
      shape="square"
    >
      <Text color="primary" fontWeight="medium" variant="normal">
        Collectibles
      </Text>
    </ListCardNav>
  ]

  return (
    <div className="flex flex-col items-center pt-4">
      <div className="flex flex-row gap-2 items-center">
        <WalletAccountGradient accountAddress={accountAddress || ''} loginIcon={LoginIconComponent} />
        <div className="flex flex-col">
          <Text color="primary" fontWeight="medium" variant="normal">
            {formatAddress(accountAddress || '')}
          </Text>

          <Text color="muted" fontWeight="medium" variant="small">
            placeholder@gmail.com
          </Text>
        </div>
        <Button variant="text" onClick={onClickAccountSelector}>
          <ChevronDownIcon color="white" />
        </Button>
      </div>
      <div className="flex flex-row gap-2 w-full mt-3">
        <OperationButtonTemplate label="Send" onClick={onClickSend} icon={SendIcon} />
        <OperationButtonTemplate label="Swap" onClick={onClickSwap} icon={SwapIcon} />
        <OperationButtonTemplate label="Receive" onClick={onClickReceive} icon={ScanIcon} />
        <OperationButtonTemplate label="Buy" onClick={onClickAddFunds} icon={AddIcon} />
      </div>
      <ListCardNavTable navItems={homeNavTableItems}>
        <>
          <Text color="primary" fontWeight="bold" variant="normal">
            Items
          </Text>
          <StackedIconTag
            iconList={selectedWallets.map(wallet => wallet.address)}
            isAccount
            label={
              <div className="flex flex-row items-center" style={{ gap: '3px' }}>
                <Text color="primary" variant="normal" fontWeight="medium">
                  {`${selectedWallets.length} Wallet${selectedWallets.length === 1 ? '' : 's'}`}
                </Text>
                <EllipsisIcon color="white" />
              </div>
            }
            onClick={onClickWalletSelector}
          />
        </>
      </ListCardNavTable>
      <ListCardNav onClick={onClickTransactions} style={{ marginTop: '8px' }}>
        <Text color="primary" fontWeight="medium" variant="normal">
          Transactions
        </Text>
      </ListCardNav>
      <ListCardNav onClick={onClickSettings} style={{ marginTop: '8px' }}>
        <Text color="primary" fontWeight="medium" variant="normal">
          Settings
        </Text>
      </ListCardNav>

      <AnimatePresence>
        {accountSelectorModalOpen && (
          <SlideupDrawer
            onClose={() => setAccountSelectorModalOpen(false)}
            label="Select active wallet"
            buttonLabel="+ Add new wallet"
            handleButtonPress={handleAddNewWallet}
            dragHandleWidth={28}
          >
            <div className="flex flex-col gap-2">
              {wallets.map((wallet, index) => (
                <SelectWalletRow
                  key={index}
                  wallet={wallet}
                  onClose={() => setAccountSelectorModalOpen(false)}
                  setActiveWallet={setActiveWallet}
                />
              ))}
            </div>
          </SlideupDrawer>
        )}
        {walletFilterOpen && (
          <FilterMenu
            onClose={() => setWalletFilterOpen(false)}
            label="Select active wallet"
            buttonLabel="Close"
            type="bypassMenuWallets"
            handleButtonPress={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

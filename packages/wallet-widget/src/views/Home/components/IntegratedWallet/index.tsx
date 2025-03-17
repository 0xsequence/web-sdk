import { compareAddress, formatAddress, useWallets, useOpenConnectModal } from '@0xsequence/connect'
import {
  Button,
  SendIcon,
  SwapIcon,
  ScanIcon,
  AddIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Text,
  Card,
  cn,
  cardVariants,
  EllipsisIcon,
  Skeleton
} from '@0xsequence/design-system'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { useGetCoinPrices, useGetExchangeRate, useGetTokenBalancesDetails } from '@0xsequence/react-hooks'
import { ethers } from 'ethers'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { useAccount } from 'wagmi'

import { GradientAvatarList } from '../../../../components/GradientAvatarList'
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
  const { address: accountAddress } = useAccount()
  const { wallets, setActiveWallet } = useWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

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
    .reduce(
      (acc, curr) =>
        acc +
        Number(
          computeBalanceFiat({
            balance: curr,
            prices: coinPrices,
            conversionRate,
            decimals: curr.contractInfo?.decimals || 18
          })
        ),
      0
    )
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

  const coinBalancesAmount = coinBalances.length
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
  }
  const onClickReceive = () => {
    setNavigation({
      location: 'receive'
    })
  }
  const onClickAddFunds = () => {
    setNavigation({
      location: 'buy'
    })
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <WalletAccountGradient accountAddress={accountAddress || ''} loginIcon={LoginIconComponent} />
        <div className="flex flex-col">
          <Button variant="text" onClick={onClickAccountSelector}>
            <Text color="primary" fontWeight="medium" variant="normal">
              {formatAddress(accountAddress || '')}
            </Text>
            <ChevronDownIcon color="white" />
          </Button>
          <Text color="primary" fontWeight="medium" variant="small">
            placeholder@gmail.com
          </Text>
        </div>
        {wallets.map(wallet => (
          <div key={wallet.signInMethod}>{getConnectorLogo(wallet.signInMethod)}</div>
        ))}
      </div>
      <div className="flex flex-row gap-1">
        <OperationButtonTemplate label="Send" onClick={onClickSend} icon={SendIcon} />
        <OperationButtonTemplate label="Swap" onClick={onClickSwap} icon={SwapIcon} />
        <OperationButtonTemplate label="Receive" onClick={onClickReceive} icon={ScanIcon} />
        <OperationButtonTemplate label="Buy" onClick={onClickAddFunds} icon={AddIcon} />
      </div>
      <Card className="p-0 mt-4">
        <div
          className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
          onClick={onClickWalletSelector}
          style={{ borderRadius: '0px', background: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Text color="primary" fontWeight="bold" variant="normal">
            Assets
          </Text>
          <div className="flex flex-row gap-1 items-center">
            <Text color="primary" fontWeight="bold" variant="xsmall">
              All wallets
            </Text>
            <GradientAvatarList accountAddressList={selectedWallets.map(wallet => wallet.address)} />
            <EllipsisIcon color="white" />
          </div>
        </div>
        <div
          className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
          onClick={onClickTokens}
          style={{ borderRadius: '0px', height: '60px' }}
        >
          <Text color="primary" fontWeight="medium" variant="normal">
            Tokens
          </Text>
          <div className="flex flex-row gap-1 items-center">
            <Text className="flex flex-row items-center" color="primary" fontWeight="medium" variant="small">
              {fiatCurrency.sign}
              {isPending ? <Skeleton className="w-4 h-4" /> : `${totalCoinPrices}`}
            </Text>
            <Text color="primary" fontWeight="medium" variant="small">
              {coinBalancesAmount}
            </Text>
            <ChevronRightIcon color="white" />
          </div>
        </div>
        <div
          className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
          onClick={onClickCollectibles}
          style={{ borderRadius: '0px', height: '60px' }}
        >
          <Text color="primary" fontWeight="medium" variant="normal">
            Collectibles
          </Text>
          <div className="flex flex-row gap-1 items-center">
            <Text color="primary" fontWeight="medium" variant="small">
              {collectibleBalancesAmount}
            </Text>
            <ChevronRightIcon color="white" />
          </div>
        </div>
      </Card>
      <Card className="p-0">
        <div
          className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
          onClick={onClickTransactions}
          style={{ height: '60px' }}
        >
          <Text color="primary" fontWeight="medium" variant="normal">
            Transactions
          </Text>
          <ChevronRightIcon color="white" />
        </div>
      </Card>
      <Card className="p-0">
        <div
          className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
          onClick={onClickSettings}
          style={{ height: '60px' }}
        >
          <Text color="primary" fontWeight="medium" variant="normal">
            Settings
          </Text>
          <ChevronRightIcon color="white" />
        </div>
      </Card>

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

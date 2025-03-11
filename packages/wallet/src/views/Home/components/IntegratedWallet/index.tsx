import {
  Button,
  SendIcon,
  SwapIcon,
  ScanIcon,
  AddIcon,
  GoogleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Text,
  Card,
  cn,
  cardVariants,
  EllipsisIcon
} from '@0xsequence/design-system'
import { useNavigation, useSettings } from '../../../../hooks'

import { useAccount } from 'wagmi'
import { useGetCoinPrices, useGetExchangeRate, useGetTokenBalancesSummary } from '@0xsequence/kit-hooks'
import { ContractVerificationStatus } from '@0xsequence/indexer'
import { compareAddress, formatAddress, useKitWallets, useOpenConnectModal } from '@0xsequence/kit'
import { ethers } from 'ethers'
import { computeBalanceFiat } from '../../../../utils'
import { OperationButtonTemplate } from './Buttons/OperationButtonTemplate'
import { WalletAccountGradient } from '../../../../shared/WalletAccountGradient'
import { GradientAvatarList } from '../../../../shared/GradientAvatarList'
import { useState } from 'react'
import { SlideupDrawer } from '../../../../shared/SlideupDrawer'
import { SelectWalletRow } from '../../../../shared/SelectWalletRow'

export const IntegratedWallet = () => {
  const { setNavigation } = useNavigation()
  const { selectedNetworks, hideUnlistedTokens, fiatCurrency } = useSettings()
  const { address: accountAddress } = useAccount()
  const { wallets, setActiveWallet } = useKitWallets()
  const { setOpenConnectModal } = useOpenConnectModal()

  const [accountSelectorModalOpen, setAccountSelectorModalOpen] = useState(false)

  const { data: tokenBalancesData, isPending: isPendingTokenBalances } = useGetTokenBalancesSummary({
    chainIds: selectedNetworks,
    filter: {
      accountAddresses: accountAddress ? [accountAddress] : [],
      contractStatus: hideUnlistedTokens ? ContractVerificationStatus.VERIFIED : ContractVerificationStatus.ALL,
      omitNativeBalances: false
    }
  })

  const coinBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC20' || compareAddress(b.contractAddress, ethers.ZeroAddress)) || []

  const collectionBalancesUnordered =
    tokenBalancesData?.filter(b => b.contractType === 'ERC721' || b.contractType === 'ERC1155') || []

  const { data: coinPrices = [], isPending: isPendingCoinPrices } = useGetCoinPrices(
    coinBalancesUnordered.map(token => ({
      chainId: token.chainId,
      contractAddress: token.contractAddress
    }))
  )

  const { data: conversionRate = 1, isPending: isPendingConversionRate } = useGetExchangeRate(fiatCurrency.symbol)

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

  const isPending = isPendingTokenBalances || isPendingCoinPrices || isPendingConversionRate

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

  const collectionBalances = collectionBalancesUnordered.sort((a, b) => {
    return Number(b.balance) - Number(a.balance)
  })

  const coinBalancesAmount = coinBalances.length
  const collectionBalancesAmount = collectionBalances.length

  const onClickAccountSelector = () => {
    setAccountSelectorModalOpen(true)
  }
  const handleAddNewWallet = () => {
    setAccountSelectorModalOpen(false)
    setOpenConnectModal(true)
  }
  const onClickSend = () => {
    setNavigation &&
      setNavigation({
        location: 'send'
      })
  }
  const onClickSwap = () => {
    setNavigation &&
      setNavigation({
        location: 'swap'
      })
  }
  const onClickReceive = () => {
    setNavigation &&
      setNavigation({
        location: 'receive'
      })
  }
  const onClickAddFunds = () => {
    setNavigation({
      location: 'buy'
    })
  }
  const onClickWalletSelector = () => {}
  const onClickTokens = () => {
    setNavigation &&
      setNavigation({
        location: 'search-tokens'
      })
  }
  const onClickCollections = () => {
    setNavigation &&
      setNavigation({
        location: 'search-collectibles'
      })
  }
  const onClickTransactions = () => {
    setNavigation &&
      setNavigation({
        location: 'history'
      })
  }
  const onClickSettings = () => {
    setNavigation &&
      setNavigation({
        location: 'settings'
      })
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <WalletAccountGradient
          accountAddress={accountAddress || ''}
          loginIcon={wallets.find(wallet => wallet.isActive)?.logoDark || wallets[0].logoDark}
        />
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
          <div key={wallet.id}>
            <wallet.logoDark />
          </div>
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
            <GradientAvatarList accountAddressList={wallets.map(wallet => wallet.address)} />
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
            <Text color="primary" fontWeight="medium" variant="small">
              ${totalCoinPrices}
            </Text>
            <Text color="primary" fontWeight="medium" variant="small">
              {coinBalancesAmount}
            </Text>
            <ChevronRightIcon color="white" />
          </div>
        </div>
        <div
          className={cn(cardVariants({ clickable: true }), 'flex flex-row justify-between items-center')}
          onClick={onClickCollections}
          style={{ borderRadius: '0px', height: '60px' }}
        >
          <Text color="primary" fontWeight="medium" variant="normal">
            Collections
          </Text>
          <div className="flex flex-row gap-1 items-center">
            <Text color="primary" fontWeight="medium" variant="small">
              {collectionBalancesAmount}
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

      {accountSelectorModalOpen && (
        <SlideupDrawer
          onClose={() => setAccountSelectorModalOpen(false)}
          label="Select active wallet"
          buttonLabel="+ Add new wallet"
          handleButtonPress={handleAddNewWallet}
          dragHandleWidth={28}
        >
          <div className="flex flex-col gap-2">
            {wallets.map(wallet => (
              <SelectWalletRow
                wallet={wallet}
                onClose={() => setAccountSelectorModalOpen(false)}
                setActiveWallet={setActiveWallet}
              />
            ))}
          </div>
        </SlideupDrawer>
      )}
    </div>
  )
}

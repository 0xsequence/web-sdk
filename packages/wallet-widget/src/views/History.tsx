import { getNativeTokenInfoByChainId } from '@0xsequence/connect'
import { compareAddress, SearchIcon, TextInput } from '@0xsequence/design-system'
import { useGetTransactionHistorySummary } from '@0xsequence/hooks'
import { Transaction } from '@0xsequence/indexer'
import Fuse from 'fuse.js'
import { useObservable } from 'micro-observables'
import { useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import { useConfig } from 'wagmi'

import { FilterButton } from '../components/Filter/FilterButton'
import { TransactionHistoryList } from '../components/TransactionHistoryList'
import { useSettings } from '../hooks'

export const History = () => {
  const { chains } = useConfig()
  const { selectedNetworksObservable, selectedWalletsObservable } = useSettings()

  const selectedNetworks = useObservable(selectedNetworksObservable)
  const selectedWallets = useObservable(selectedWalletsObservable)

  const [search, setSearch] = useState('')

  const { data: transactionHistory = [], isPending: isPendingTransactionHistory } = useGetTransactionHistorySummary({
    accountAddresses: selectedWallets.map(wallet => wallet.address),
    chainIds: selectedNetworks
  })

  const fuseOptions = {
    threshold: 0.1,
    ignoreLocation: true,
    keys: [
      {
        name: 'contractName',
        getFn: (transaction: Transaction) => {
          return transaction.transfers?.map(transfer => transfer.contractInfo?.name).join(', ') || ''
        }
      },
      {
        name: 'tokenSymbol',
        getFn: (transaction: Transaction) => {
          const hasNativeToken = transaction.transfers?.some(transfer =>
            compareAddress(transfer.contractInfo?.address, zeroAddress)
          )
          if (hasNativeToken) {
            const nativeTokenInfo = getNativeTokenInfoByChainId(transaction.chainId, chains)
            return nativeTokenInfo.symbol
          }
          return transaction.transfers?.map(transfer => transfer.contractInfo?.symbol).join(', ') || ''
        }
      },
      {
        name: 'collectibleName',
        getFn: (transaction: Transaction) => {
          return (
            transaction.transfers
              ?.map(transfer => {
                return Object.values(transfer.tokenMetadata || {})
                  .map(tokenMetadata => {
                    return tokenMetadata?.name
                  })
                  .join(', ')
              })
              .join(', ') || ''
          )
        }
      },
      {
        name: 'date',
        getFn: (transaction: Transaction) => {
          const date = new Date(transaction.timestamp)
          const day = date.getDate()
          const month = date.toLocaleString('en-US', { month: 'long' })
          const year = date.getFullYear()
          return `
          ${day} ${month} ${year} 
          ${day} ${year} ${month} 
          ${month} ${day} ${year} 
          ${month} ${year} ${day}
          ${year} ${day} ${month}
          ${year} ${month} ${day}
          `
        },
        customSearchFn: (query: string, options: { keys: string[] }) => {
          const queryParts = query.toLowerCase().split(/\s+/)
          const dayQuery = queryParts.find(part => /^\d{1,2}$/.test(part))
          const monthQuery = queryParts.find(part => /^[a-zA-Z]+$/.test(part))
          const yearQuery = queryParts.find(part => /^\d{4}$/.test(part))

          console.log(dayQuery, monthQuery, yearQuery)

          return options.keys.some(key => {
            const keyParts = key.toLowerCase().split(/\s+/)
            let keyDay = '',
              keyMonth = '',
              keyYear = ''

            keyParts.forEach(part => {
              if (/^\d{1,2}$/.test(part)) {
                keyDay = part
              } else if (/^[a-zA-Z]+$/.test(part)) {
                keyMonth = part
              } else if (/^\d{4}$/.test(part)) {
                keyYear = part
              }
            })

            return (
              (!dayQuery || keyDay === dayQuery) &&
              (!monthQuery || keyMonth === monthQuery) &&
              (!yearQuery || keyYear === yearQuery)
            )
          })
        }
      }
    ]
  }

  const fuse = useMemo(() => {
    return new Fuse(transactionHistory, fuseOptions)
  }, [transactionHistory])

  const searchResults = useMemo(() => {
    if (!search.trimStart()) {
      return []
    }
    return fuse.search(search).map(result => result.item)
  }, [search, fuse])

  return (
    <div className="flex flex-col gap-3 p-4 pt-2">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <div className="grow">
          <TextInput
            autoFocus
            name="search wallet"
            leftIcon={SearchIcon}
            value={search}
            onChange={ev => setSearch(ev.target.value)}
            placeholder="Search your wallet"
            data-1p-ignore
          />
        </div>
        <FilterButton label="Transaction Filters" type="transactions" />
      </div>
      <TransactionHistoryList
        transactions={search ? searchResults : transactionHistory}
        isPending={isPendingTransactionHistory}
        isFetchingNextPage={false}
      />
    </div>
  )
}

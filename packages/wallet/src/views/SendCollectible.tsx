import React, { useRef, useState, ChangeEvent, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  Box,
  Button,
  ChevronRightIcon,
  CopyIcon,
  CloseIcon,
  GradientAvatar,
  AddIcon,
  SubtractIcon,
  Text,
  NumericInput,
  TextInput,
  vars,
  Spinner
} from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId, useAnalyticsContext, ExtendedConnector } from '@0xsequence/kit'
import { TokenBalance, Transaction } from '@0xsequence/indexer'
import { useAccount, useChainId, useSwitchChain, useConfig, useSendTransaction } from 'wagmi'

import { SendItemInfo } from '../shared/SendItemInfo'
import { ERC_1155_ABI, ERC_721_ABI, HEADER_HEIGHT } from '../constants'
import { useCollectibleBalance, useNavigation, useOpenWalletModal } from '../hooks'
import { limitDecimals, isEthAddress, truncateAtMiddle } from '../utils'
import * as sharedStyles from '../shared/styles.css'

interface SendCollectibleProps {
  chainId: number
  contractAddress: string
  tokenId: string
}

export const SendCollectible = ({ chainId, contractAddress, tokenId }: SendCollectibleProps) => {
  const { setNavigation } = useNavigation()
  const { analytics } = useAnalyticsContext()
  const { chains } = useConfig()
  const connectedChainId = useChainId()
  const { address: accountAddress = '', connector } = useAccount()
  /* @ts-ignore-next-line */
  const isConnectorSequenceBased = !!connector?._wallet?.isSequenceBased
  const isCorrectChainId = connectedChainId === chainId
  const showSwitchNetwork = !isCorrectChainId && !isConnectorSequenceBased
  const { switchChain } = useSwitchChain()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const { setOpenWalletModal } = useOpenWalletModal()
  const [amount, setAmount] = useState<string>('0')
  const [toAddress, setToAddress] = useState<string>('')
  const [showAmountControls, setShowAmountControls] = useState<boolean>(false)
  const { sendTransaction } = useSendTransaction()
  const [isSendTxnPending, setIsSendTxnPending] = useState(false)
  const { data: tokenBalance, isLoading: isLoadingBalances } = useCollectibleBalance({
    accountAddress: accountAddress,
    chainId,
    collectionAddress: contractAddress,
    tokenId,
    verifiedOnly: false
  })
  const { contractType } = tokenBalance as TokenBalance

  useEffect(() => {
    if (tokenBalance) {
      if (contractType === 'ERC721') {
        setAmount('1')
        setShowAmountControls(false)
      } else if (contractType === 'ERC1155') {
        if (Number(ethers.utils.formatUnits(tokenBalance?.balance || 0, decimals)) >= 1) {
          setAmount('1')
        }
        setShowAmountControls(true)
      }
    }
  }, [tokenBalance])

  const nativeTokenInfo = getNativeTokenInfoByChainId(chainId, chains)

  const isLoading = isLoadingBalances

  if (isLoading) {
    return null
  }

  const decimals = tokenBalance?.tokenMetadata?.decimals || 0
  const name = tokenBalance?.tokenMetadata?.name || 'Unknown'
  const imageUrl = tokenBalance?.tokenMetadata?.image || tokenBalance?.contractInfo?.logoURI || ''
  const amountToSendFormatted = amount === '' ? '0' : amount
  const amountRaw = ethers.utils.parseUnits(amountToSendFormatted, decimals)

  const insufficientFunds = amountRaw.gt(tokenBalance?.balance || '0')
  const isNonZeroAmount = amountRaw.gt(0)

  const handleChangeAmount = (ev: ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target

    // Prevent value from having more decimals than the token supports
    const formattedValue = limitDecimals(value, decimals)

    setAmount(formattedValue)
  }

  const handleSubtractOne = () => {
    amountInputRef.current?.focus()
    const decrementedAmount = Number(amount) - 1

    const newAmount = Math.max(decrementedAmount, 0).toString()
    setAmount(newAmount)
  }

  const handleAddOne = () => {
    amountInputRef.current?.focus()
    const incrementedAmount = Number(amount) + 1
    const maxAmount = Number(ethers.utils.formatUnits(tokenBalance?.balance || 0, decimals))

    const newAmount = Math.min(incrementedAmount, maxAmount).toString()

    setAmount(newAmount)
  }

  const handleMax = () => {
    amountInputRef.current?.focus()
    const maxAmount = ethers.utils.formatUnits(tokenBalance?.balance || 0, decimals).toString()

    setAmount(maxAmount)
  }

  const handlePaste = async () => {
    const result = await navigator.clipboard.readText()
    setToAddress(result)
  }

  const handleToAddressClear = () => {
    setToAddress('')
  }

  const executeTransaction = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isCorrectChainId && isConnectorSequenceBased) {
      switchChain({ chainId })
    }

    const sendAmount = ethers.utils.parseUnits(amountToSendFormatted, decimals)

    switch (contractType) {
      case 'ERC721':
        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
            source: 'sequence-kit/wallet'
          }
        })
        setIsSendTxnPending(true)
        // _from, _to, _id
        sendTransaction(
          {
            to: (tokenBalance as TokenBalance).contractAddress as `0x${string}}`,
            data: new ethers.utils.Interface(ERC_721_ABI).encodeFunctionData('safeTransferFrom', [
              accountAddress,
              toAddress,
              tokenId
            ]) as `0x${string}`,
            gas: null
          },
          {
            onSettled: (result, error) => {
              if (result) {
                setNavigation({
                  location: 'home'
                })
              }
              setIsSendTxnPending(false)
            }
          }
        )
        break
      case 'ERC1155':
      default:
        analytics?.track({
          event: 'SEND_TRANSACTION_REQUEST',
          props: {
            walletClient: (connector as ExtendedConnector | undefined)?._wallet?.id || 'unknown',
            source: 'sequence-kit/wallet'
          }
        })
        setIsSendTxnPending(true)
        // _from, _to, _ids, _amounts, _data
        sendTransaction(
          {
            to: (tokenBalance as TokenBalance).contractAddress as `0x${string}}`,
            data: new ethers.utils.Interface(ERC_1155_ABI).encodeFunctionData('safeBatchTransferFrom', [
              accountAddress,
              toAddress,
              [tokenId],
              [sendAmount.toHexString()],
              []
            ]) as `0x${string}`,
            gas: null
          },
          {
            onSettled: (result, error) => {
              if (result) {
                setNavigation({
                  location: 'home'
                })
              }
              setIsSendTxnPending(false)
            }
          }
        )
    }
  }

  const maxAmount = ethers.utils.formatUnits(tokenBalance?.balance || 0, decimals).toString()

  const isMinimum = Number(amount) === 0
  const isMaximum = Number(amount) >= Number(maxAmount)

  return (
    <Box
      padding="5"
      paddingTop="3"
      style={{
        marginTop: HEADER_HEIGHT
      }}
      gap="2"
      flexDirection="column"
      as="form"
      onSubmit={executeTransaction}
      pointerEvents={isSendTxnPending ? 'none' : 'auto'}
    >
      <Box background="backgroundSecondary" borderRadius="md" padding="4" gap="2" flexDirection="column">
        <SendItemInfo
          imageUrl={imageUrl}
          showSquareImage
          decimals={decimals}
          name={name}
          symbol={''}
          balance={tokenBalance?.balance || '0'}
          chainId={chainId}
        />
        <NumericInput
          ref={amountInputRef}
          style={{ fontSize: vars.fontSizes.xlarge, fontWeight: vars.fontWeights.bold }}
          name="amount"
          value={amount}
          onChange={handleChangeAmount}
          disabled={!showAmountControls}
          controls={
            <>
              {showAmountControls && (
                <Box gap="2">
                  <Button disabled={isMinimum} size="xs" onClick={handleSubtractOne} leftIcon={SubtractIcon} />
                  <Button disabled={isMaximum} size="xs" onClick={handleAddOne} leftIcon={AddIcon} />
                  <Button size="xs" shape="square" label="Max" onClick={handleMax} data-id="maxCoin" flexShrink="0" />
                </Box>
              )}
            </>
          }
        />
        {insufficientFunds && (
          <Text as="div" variant="normal" color="negative" marginTop="2">
            Insufficient Balance
          </Text>
        )}
      </Box>
      <Box background="backgroundSecondary" borderRadius="md" padding="4" gap="2" flexDirection="column">
        <Text fontSize="normal" color="text50">
          To
        </Text>
        {isEthAddress(toAddress) ? (
          <Box
            borderRadius="md"
            background="backgroundSecondary"
            width="full"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            padding="4"
            className={sharedStyles.clickable}
            onClick={handleToAddressClear}
            style={{ height: '52px' }}
          >
            <Box flexDirection="row" justifyContent="center" alignItems="center" gap="2">
              <GradientAvatar address={toAddress} style={{ width: '20px' }} />
              <Text color="text100">{`0x${truncateAtMiddle(toAddress.substring(2), 8)}`}</Text>
            </Box>
            <CloseIcon size="xs" />
          </Box>
        ) : (
          <TextInput
            value={toAddress}
            onChange={ev => setToAddress(ev.target.value)}
            placeholder={`${nativeTokenInfo.name} Address (0x...)`}
            name="to-address"
            data-1p-ignore
            controls={
              <Button
                size="xs"
                shape="square"
                label="Paste"
                onClick={handlePaste}
                data-id="to-address"
                flexShrink="0"
                leftIcon={CopyIcon}
              />
            }
          />
        )}
      </Box>

      {showSwitchNetwork && (
        <Box marginTop="3">
          <Text variant="small" color="negative" marginBottom="2">
            The wallet is connected to the wrong network. Please switch network before proceeding
          </Text>
          <Button
            marginTop="2"
            width="full"
            variant="primary"
            type="button"
            label="Switch Network"
            onClick={() => switchChain({ chainId })}
            disabled={isCorrectChainId}
            style={{ height: '52px', borderRadius: vars.radii.md }}
          />
        </Box>
      )}

      <Box style={{ height: '52px' }} alignItems="center" justifyContent="center">
        {isSendTxnPending ? (
          <Spinner />
        ) : (
          <Button
            color="text100"
            marginTop="3"
            width="full"
            variant="primary"
            type="submit"
            disabled={
              !isNonZeroAmount ||
              !isEthAddress(toAddress) ||
              insufficientFunds ||
              (!isCorrectChainId && !isConnectorSequenceBased)
            }
            label="Send"
            rightIcon={ChevronRightIcon}
            style={{ height: '52px', borderRadius: vars.radii.md }}
          />
        )}
      </Box>
    </Box>
  )
}

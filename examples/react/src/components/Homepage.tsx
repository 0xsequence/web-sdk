import React, { useEffect } from 'react'
import qs from 'query-string'
import { useOpenConnectModal, signEthAuthProof, validateEthProof, useTheme as useKitTheme } from '@0xsequence/kit'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { useCheckoutModal } from '@0xsequence/kit-checkout'
import {
  useDisconnect,
  useAccount,
  useWalletClient,
  usePublicClient,
  useChainId,
  useSwitchChain,
  useSendTransaction
} from 'wagmi'
import {
  Box,
  Button,
  Card,
  Text,
  Image,
  SunIcon,
  MoonIcon,
  SignoutIcon,
  useTheme,
  vars,
  Spinner,
  useMediaQuery
} from '@0xsequence/design-system'

import { Footer } from './Footer'
import { messageToSign } from '../constants'
import { formatAddress, getCheckoutSettings } from '../utils'
import { sequence } from '0xsequence'

function Homepage() {
  const { theme, setTheme } = useTheme()
  const { setTheme: setKitTheme } = useKitTheme()
  const { address, connector, isConnected } = useAccount()
  const { setOpenConnectModal } = useOpenConnectModal()
  const { setOpenWalletModal } = useOpenWalletModal()
  const { triggerCheckout } = useCheckoutModal()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const { switchChain } = useSwitchChain()

  const isMobile = useMediaQuery('isMobile')

  const { data: txnData, sendTransaction, isLoading: isSendTxnLoading } = useSendTransaction()

  const [isSigningMessage, setIsSigningMessage] = React.useState(false)
  const [isMessageValid, setIsMessageValid] = React.useState<boolean | undefined>()
  const [messageSig, setMessageSig] = React.useState<string | undefined>()

  const chainId = useChainId()

  const networkForCurrentChainId = sequence.network.allNetworks.find(n => n.chainId === chainId)

  const publicClient = usePublicClient({ chainId })

  // append ?debug=true to url to enable debug mode
  const { debug } = qs.parse(location.search)
  const isDebugMode = debug === 'true'

  const generateEthAuthProof = async () => {
    if (!walletClient || !publicClient) {
      return
    }

    try {
      const proof = await signEthAuthProof(walletClient)
      console.log('proof:', proof)

      const isValid = await validateEthProof(walletClient, publicClient, proof)
      console.log('isValid?:', isValid)
    } catch (e) {
      console.error(e)
    }
  }

  const signMessage = async () => {
    if (!walletClient) {
      return
    }

    setIsSigningMessage(true)

    try {
      const message = messageToSign

      // sign
      const sig = await walletClient.signMessage({
        account: address || ('' as `0x${string}`),
        message
      })
      console.log('address', address)
      console.log('signature:', sig)
      console.log('chainId in homepage', chainId)

      const [account] = await walletClient.getAddresses()

      const isValid = await publicClient.verifyMessage({
        address: account,
        message,
        signature: sig
      })

      setIsSigningMessage(false)
      setIsMessageValid(isValid)
      setMessageSig(sig)

      console.log('isValid?', isValid)
    } catch (e) {
      setIsSigningMessage(false)
      console.error(e)
    }
  }

  const runSendTransaction = async () => {
    if (!walletClient) {
      return
    }

    const [account] = await walletClient.getAddresses()

    sendTransaction({ to: account, value: '0', gas: null })
  }

  const onClickChangeTheme = () => {
    // Change theme at the app level
    setTheme(theme === 'dark' ? 'light' : 'dark')
    // Change the theme in kit. Theme can also be changed in the settings for kit only
    setKitTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const HeaderContent = () => {
    if (!isConnected) {
      return (
        <Box padding="5" justifyContent="flex-end">
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
            <SwitchThemeButton />
          </Box>
        </Box>
      )
    }

    return (
      <Box padding="5" justifyContent="space-between">
        <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
          <Image style={{ width: '36px' }} src="kit-logo.svg" />
          <Image
            style={{
              width: '24px',
              filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
            }}
            src="kit-logo-text.svg"
          />
        </Box>
        <Box>
          <Box flexDirection="column">
            <Box flexDirection="row" gap="2" justifyContent="flex-end" alignItems="center">
              <Box style={{ marginRight: '-12px' }}>
                <SwitchThemeButton />
              </Box>
              <Text fontWeight="medium" fontSize="normal" color="text100">
                {isMobile ? formatAddress(address || '') : address}
              </Text>
            </Box>
            <Box alignItems="center" justifyContent="flex-end" flexDirection="row">
              <Text fontWeight="medium" fontSize="normal" color="text50">
                {connector?.name}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  interface ClickableCardProps {
    title: string
    description: string
    isLoading?: boolean
    onClick: () => void
  }

  const ClickableCard = ({ title, description, isLoading, onClick }: ClickableCardProps) => {
    return (
      <Card style={{ width: '332px' }} clickable onClick={onClick}>
        <Text color="text100" lineHeight="5" fontSize="normal" fontWeight="bold">
          {title}
        </Text>
        <Box marginTop="1">
          <Text fontWeight="medium" lineHeight="5" color="text50" fontSize="normal">
            {description}
          </Text>
        </Box>
        {isLoading && <Spinner marginTop="3" size="sm" color="text100" />}
      </Card>
    )
  }

  const onClickConnect = () => {
    setOpenConnectModal(true)
  }

  const onClickCheckout = () => {
    triggerCheckout(getCheckoutSettings(address))
  }

  const SwitchThemeButton = () => {
    return (
      <Button
        variant="base"
        style={{ color: vars.colors.text100 }}
        onClick={onClickChangeTheme}
        leftIcon={theme === 'dark' ? SunIcon : MoonIcon}
      />
    )
  }

  const onSwitchNetwork = () => {
    if (chainId === 80001) {
      switchChain({ chainId: 137 })
    } else {
      switchChain({ chainId: 80001 })
    }

    setIsMessageValid(undefined)
  }

  return (
    <Box background="backgroundPrimary">
      {isDebugMode && (
        <Box justifyContent="center" alignItems="center">
          <Text>Debug mode</Text>
        </Box>
      )}
      <Box style={{ height: '72px' }} position="fixed" width="full" top="0">
        <HeaderContent />
      </Box>
      <Box
        style={isMobile ? { paddingTop: '85px', paddingBottom: '80px' } : { height: '100vh' }}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {isConnected ? (
          <Box flexDirection="column" gap="4">
            <Box flexDirection="column" gap="2">
              <Text color="text50" fontSize="small" fontWeight="medium">
                Demos
              </Text>
              <ClickableCard
                title="Embedded wallet"
                description="Connect a Sequence wallet to view, swap, send, and receive collections"
                onClick={() => setOpenWalletModal(true)}
              />
              <ClickableCard
                title="Checkout"
                description="Checkout screen before placing a purchase on coins or collections"
                onClick={onClickCheckout}
              />
              <ClickableCard
                title="Send transaction"
                description="Send a transaction with your wallet"
                isLoading={isSendTxnLoading}
                onClick={runSendTransaction}
              />

              {txnData && txnData.chainId === chainId && (
                <Text
                  as="a"
                  marginLeft="4"
                  variant="small"
                  underline
                  href={`${networkForCurrentChainId.blockExplorer.rootUrl}/tx/${txnData.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on {networkForCurrentChainId.blockExplorer.name}
                </Text>
              )}
              <ClickableCard
                title="Sign message"
                description="Sign a message with your wallet"
                onClick={signMessage}
                isLoading={isSigningMessage}
              />
              {isMessageValid && (
                <Card style={{ width: '332px' }} flexDirection={'column'} gap={'2'}>
                  <Text variant="medium">Signed message:</Text>
                  <Text>{messageToSign}</Text>
                  <Text variant="medium">Signature:</Text>
                  <Text variant="code" as="p" ellipsis>
                    {messageSig}
                  </Text>
                  <Text variant="medium">
                    isValid: <Text variant="code">{isMessageValid.toString()}</Text>
                  </Text>
                </Card>
              )}

              {isDebugMode && (
                <ClickableCard
                  title="Generate EthAuth proof"
                  description="Generate EthAuth proof"
                  onClick={generateEthAuthProof}
                />
              )}
              <ClickableCard title="Switch network" description={`Current chainId: ${chainId}`} onClick={onSwitchNetwork} />
            </Box>
            <Box width="full" gap="2" flexDirection="row" justifyContent="flex-end">
              <Button onClick={() => disconnect()} leftIcon={SignoutIcon} label="Sign out" />
            </Box>
          </Box>
        ) : (
          <Box>
            <Box flexDirection="column" alignItems="center" justifyContent="center" gap="5">
              <Box flexDirection="row" alignItems="center" justifyContent="center" gap="3">
                <Image style={{ width: '48px' }} src="kit-logo.svg" />
                <Image
                  style={{
                    width: '32px',
                    filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
                  }}
                  src="kit-logo-text.svg"
                />
              </Box>
              <Box gap="2" flexDirection="row" alignItems="center">
                <Button onClick={onClickConnect} variant="feature" label="Connect" />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      {!isMobile && <Footer />}
    </Box>
  )
}

export default Homepage

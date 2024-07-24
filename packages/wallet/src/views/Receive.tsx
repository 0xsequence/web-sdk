import { Box, Button, Text, CopyIcon, ShareIcon, Image } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'
import QRCode from 'qrcode.react'
import React, { useState, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useAccount, useConfig } from 'wagmi'

import { HEADER_HEIGHT } from '../constants'

export const Receive = () => {
  const { address, chain } = useAccount()
  const { chains } = useConfig()
  const [isCopied, setCopied] = useState<boolean>(false)

  const nativeTokenInfo = getNativeTokenInfoByChainId(chain?.id || 1, chains)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setCopied(false)
      }, 4000)
    }
  }, [isCopied])

  const onClickCopy = () => {
    setCopied(true)
  }

  const onClickShare = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://twitter.com/intent/tweet?text=Here%20is%20my%20address%20${address}`)
    }
  }

  return (
    <Box style={{ paddingTop: HEADER_HEIGHT }}>
      <Box padding="5" paddingTop="3" flexDirection="column" justifyContent="center" alignItems="center" gap="4">
        <Box
          marginTop="1"
          width="fit"
          background="white"
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
          padding="4"
        >
          <QRCode value={address || ''} size={200} bgColor="white" fgColor="black" data-id="receiveQR" />
        </Box>
        <Box>
          <Box flexDirection="row" alignItems="center" justifyContent="center" gap="2">
            <Text variant="medium" color="text100" textAlign="center" lineHeight="inherit" style={{ fontWeight: '700' }}>
              My Wallet
            </Text>
            <Image width="5" src={nativeTokenInfo.logoURI} alt="icon" />
          </Box>
          <Box marginTop="2" style={{ maxWidth: '180px', textAlign: 'center' }}>
            <Text
              textAlign="center"
              color="text50"
              style={{
                fontSize: '14px',
                maxWidth: '180px',
                overflowWrap: 'anywhere'
              }}
            >
              {address}
            </Text>
          </Box>
        </Box>
        <Box gap="3">
          <CopyToClipboard text={address || ''}>
            <Button onClick={onClickCopy} leftIcon={CopyIcon} label={isCopied ? 'Copied!' : 'Copy'} />
          </CopyToClipboard>
          <Button onClick={onClickShare} leftIcon={ShareIcon} label="Share" />
        </Box>
        <Box justifyContent="center" alignItems="center" style={{ maxWidth: '260px', textAlign: 'center' }}>
          <Text
            color="text100"
            variant="small"
            style={{
              maxWidth: '260px',
              overflowWrap: 'anywhere'
            }}
          >
            {`This is a ${nativeTokenInfo.name} address. Please only send assets on the ${nativeTokenInfo.name} network.`}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

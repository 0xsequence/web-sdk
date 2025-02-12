import { Button, Text, CopyIcon, ShareIcon, Image } from '@0xsequence/design-system'
import { getNativeTokenInfoByChainId } from '@0xsequence/kit'
import { QRCodeCanvas } from 'qrcode.react'
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
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <div className="flex p-5 pt-3 flex-col justify-center items-center gap-4">
        <div className="flex mt-1 w-fit bg-white rounded-xl items-center justify-center p-4">
          <QRCodeCanvas value={address || ''} size={200} bgColor="white" fgColor="black" data-id="receiveQR" />
        </div>
        <div>
          <div className="flex flex-row items-center justify-center gap-2">
            <Text className="text-center leading-[inherit]" variant="medium" color="primary" style={{ fontWeight: '700' }}>
              My Wallet
            </Text>
            <Image className="w-5" src={nativeTokenInfo.logoURI} alt="icon" />
          </div>
          <div className="mt-2" style={{ maxWidth: '180px', textAlign: 'center' }}>
            <Text
              className="text-center"
              color="muted"
              style={{
                fontSize: '14px',
                maxWidth: '180px',
                overflowWrap: 'anywhere'
              }}
            >
              {address}
            </Text>
          </div>
        </div>
        <div className="flex gap-3">
          <CopyToClipboard text={address || ''}>
            <Button onClick={onClickCopy} leftIcon={CopyIcon} label={isCopied ? 'Copied!' : 'Copy'} />
          </CopyToClipboard>
          <Button onClick={onClickShare} leftIcon={ShareIcon} label="Share" />
        </div>
        <div className="flex justify-center items-center" style={{ maxWidth: '260px', textAlign: 'center' }}>
          <Text
            color="primary"
            variant="small"
            style={{
              maxWidth: '260px',
              overflowWrap: 'anywhere'
            }}
          >
            {`This is a ${nativeTokenInfo.name} address. Please only send assets on the ${nativeTokenInfo.name} network.`}
          </Text>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Box, Card, CheckmarkIcon, CopyIcon, IconButton, Text, truncateAddress } from '@0xsequence/design-system'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { useSelectPaymentModal, useTransferFundsModal } from '../../hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useAccount } from 'wagmi'

export const TransferFunds = () => {
  const { openTransferFundsModal } = useTransferFundsModal()
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const { address: userAddress } = useAccount()
  const [isCopied, setCopy] = useState(false)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setCopy(false)
      }, 4000)
    }
  }, [isCopied])

  const handleCopy = () => {
    setCopy(true)
  }

  const onClickQrCode = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectPaymentSettings) {
      return
    }

    closeSelectPaymentModal()

    setTimeout(() => {
      openTransferFundsModal({
        walletAddress: userAddress || '',
        onClose: () => {
          setTimeout(() => {
            openSelectPaymentModal(selectPaymentSettings)
          }, 500)
        }
      })
    }, 500)
  }

  return (
    <Box width="full">
      <Box marginBottom="3">
        <Text variant="small" fontWeight="medium" color="white">
          Transfer funds to your connected wallet
        </Text>
      </Box>

      <Card
        opacity={{ hover: '80' }}
        onClick={onClickQrCode}
        cursor="pointer"
        width="full"
        justifyContent="space-between"
        padding="4"
      >
        <Box flexDirection="row" gap="3">
          <Box background="white" padding="4" borderRadius="xs" style={{ width: 40, height: 40 }}>
            <QRCodeCanvas
              value={userAddress || ''}
              size={36}
              bgColor="white"
              fgColor="black"
              data-id="qr-code"
              style={{ position: 'relative', top: '-14px', left: '-14px' }}
            />
          </Box>
          <Box flexDirection="column" justifyContent="center" alignItems="flex-start">
            <Box>
              <Text variant="normal" fontWeight="bold" color="text80">
                Transfer Funds
              </Text>
            </Box>
            <Box>
              <Text color="text50" variant="normal" fontSize="small">
                {truncateAddress(userAddress || '', 12, 4)}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <CopyToClipboard text={userAddress || ''} onCopy={handleCopy}>
            <IconButton
              color="text50"
              variant="base"
              size="md"
              icon={isCopied ? () => <CheckmarkIcon size="lg" /> : () => <CopyIcon size="lg" />}
            />
          </CopyToClipboard>
        </Box>
      </Card>
    </Box>
  )
}

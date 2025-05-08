import { Card, CheckmarkIcon, CopyIcon, IconButton, Text, truncateAddress } from '@0xsequence/design-system'
import { useClipboard } from '@0xsequence/hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { useAccount } from 'wagmi'

import { useSelectPaymentModal, useTransferFundsModal } from '../../hooks/index.js'

export const TransferFunds = () => {
  const { openTransferFundsModal } = useTransferFundsModal()
  const { openSelectPaymentModal, closeSelectPaymentModal, selectPaymentSettings } = useSelectPaymentModal()
  const { address: userAddress } = useAccount()
  const [isCopied, setCopied] = useClipboard({ timeout: 4000 })

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
    <div className="w-full">
      <div className="mb-3">
        <Text variant="small" fontWeight="medium" color="white">
          Receive funds to your connected wallet
        </Text>
      </div>
      <Card className="flex cursor-pointer w-full justify-between p-4" onClick={onClickQrCode}>
        <div className="flex flex-row gap-3 items-center">
          <div className="bg-white p-4 rounded-sm" style={{ width: 40, height: 40 }}>
            <QRCodeCanvas
              value={userAddress || ''}
              size={36}
              bgColor="white"
              fgColor="black"
              data-id="qr-code"
              style={{ position: 'relative', top: '-14px', left: '-14px' }}
            />
          </div>
          <div className="flex flex-col justify-center items-start">
            <div>
              <Text variant="normal" fontWeight="bold" color="secondary">
                Receive Funds
              </Text>
            </div>
            <div>
              <Text className="text-sm" color="muted" variant="normal">
                {truncateAddress(userAddress || '', 12, 4)}
              </Text>
            </div>
          </div>
        </div>
        <div
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <IconButton
            className="text-muted"
            variant="base"
            size="md"
            icon={isCopied ? () => <CheckmarkIcon size="lg" /> : () => <CopyIcon size="lg" />}
            onClick={() => setCopied(userAddress || '')}
          />
        </div>
      </Card>
    </div>
  )
}

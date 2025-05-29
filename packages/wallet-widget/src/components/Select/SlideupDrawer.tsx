import { Divider } from '@0xsequence/design-system'
import { motion } from 'motion/react'
import { useContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import { WALLET_WIDTH } from '../../constants/index.js'
import { WalletContentRefContext } from '../../contexts/WalletContentRef.js'

export const SlideupDrawer = ({
  header,
  children,
  footer,
  onClose
}: {
  header: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
}) => {
  const [walletContentHeight, setWalletContentHeight] = useState(0)
  const walletContentRef = useContext(WalletContentRefContext)

  useEffect(() => {
    const rect = walletContentRef?.current?.getBoundingClientRect()
    if (rect) {
      setWalletContentHeight(rect.height)
    }
  }, [walletContentRef])

  if (!walletContentRef.current) {
    return null
  }

  return ReactDOM.createPortal(
    <>
      <motion.div
        key="modal-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(38, 38, 38, 1)',
          zIndex: 30
        }}
        onClick={e => {
          e.stopPropagation()
          onClose()
        }}
      />
      <motion.div
        key="modal-content"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 100) {
            onClose()
          }
        }}
        style={{
          maxWidth: WALLET_WIDTH,
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-background-primary p-0 rounded-xl" style={{ flex: 1 }}>
          <div className="flex flex-row justify-start p-4">{header}</div>
          <div
            className="rounded-none bg-background-primary px-4 pb-4"
            style={{ height: 'auto', maxHeight: `calc(${walletContentHeight}px / 2)`, overflowY: 'auto' }}
          >
            {children}
          </div>
          {footer && (
            <>
              <Divider className="my-0" />
              <div className="flex flex-row justify-start p-4">{footer}</div>
            </>
          )}
        </div>
      </motion.div>
    </>,
    walletContentRef.current
  )
}

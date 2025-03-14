import { Card, cardVariants, cn, Divider, Text, ChevronLeftIcon, Button } from '@0xsequence/design-system'
import { motion } from 'motion/react'

import { WALLET_WIDTH } from './SequenceWalletProvider'

export const SlideupDrawer = ({
  label,
  children,
  buttonLabel,
  dragHandleWidth = 64,
  onClose,
  handleButtonPress,
  onBackPress
}: {
  label: string
  children: React.ReactNode
  buttonLabel?: string
  dragHandleWidth?: number
  onClose: () => void
  handleButtonPress?: () => void
  onBackPress?: () => void
}) => {
  return (
    <>
      <motion.div
        key="modal-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'black'
        }}
        onClick={onClose}
      />
      <motion.div
        key="modal-content"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          maxWidth: WALLET_WIDTH,
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '80%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-background-primary p-0" style={{ flex: 1 }}>
          <Card className={cn('flex flex-row rounded-none pt-2', onBackPress ? 'justify-between' : 'justify-center')}>
            {onBackPress && (
              <Button variant="text" className="pt-2" onClick={onBackPress}>
                <ChevronLeftIcon color="white" />
              </Button>
            )}
            <div className="flex flex-col">
              <div className="flex justify-center items-center rounded-none p-0">
                <div className="rounded-full" style={{ width: dragHandleWidth, height: '4px', backgroundColor: 'white' }} />
              </div>
              <div className="flex flex-col items-center w-full rounded-none pt-2">
                <Text color="primary" fontWeight="medium" variant="normal" style={{ display: 'flex', justifyContent: 'center' }}>
                  {label}
                </Text>
              </div>
            </div>
            {onBackPress && <div style={{ width: '20px' }}></div>}
          </Card>
          <Card className="rounded-none bg-background-raised" style={{ height: '80%', overflowY: 'auto' }}>
            {children}
          </Card>
          <Divider className="my-0" />
          <Card className="rounded-none">
            <div
              className={cn(cardVariants({ clickable: true }), 'flex justify-center items-center rounded-full gap-2 p-3')}
              onClick={handleButtonPress}
            >
              <Text color="primary" fontWeight="bold" variant="normal">
                {buttonLabel}
              </Text>
            </div>
          </Card>
        </Card>
      </motion.div>
    </>
  )
}

import { AnimatePresence, motion } from 'motion/react'
import { WALLET_WIDTH } from '.'
import { Card, cardVariants, cn, Divider, Text } from '@0xsequence/design-system'

export const SlideupDrawer = ({
  onClose,
  label,
  children,
  buttonLabel,
  handleButtonPress,
  dragHandleWidth = 64
}: {
  onClose: () => void
  label: string
  children: React.ReactNode
  buttonLabel?: string
  handleButtonPress?: () => void
  dragHandleWidth?: number
}) => {
  return (
    <AnimatePresence>
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
          backgroundColor: 'black',
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
        }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="p-0 bg-background-primary">
          <Card className="flex justify-center items-center rounded-none p-0 pt-2">
            <div className="rounded-full" style={{ width: dragHandleWidth, height: '4px', backgroundColor: 'white' }} />
          </Card>
          <Card className="flex flex-col gap-2 items-center w-full rounded-none" style={{ paddingTop: '4px' }}>
            <Text color="primary" fontWeight="medium" variant="normal" style={{ display: 'flex', justifyContent: 'center' }}>
              {label}
            </Text>
          </Card>
          <Card className="rounded-none bg-background-raised">
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
    </AnimatePresence>
  )
}

import {
  Box,
} from '@0xsequence/design-system'

import { useAddFundsModal } from '../hooks'
import { getTransakLink } from '../utils/transak'

export const AddFundsContent = () => {
  const { addFundsSettings } = useAddFundsModal()

  if (!addFundsSettings) {
    return
  }

  const link = getTransakLink(addFundsSettings)

  return (
    <Box alignItems="center" width="full" height="full" paddingX="4">
      <Box as="iframe" width="full" height="full" borderWidth="none" src={link} />
    </Box>
  )
}

import { CARD_HEIGHT, CARD_HEIGHT_MOBILE } from '../constants'

export const getCardHeight = (isMobile: boolean) => {
  if (isMobile) {
    return CARD_HEIGHT_MOBILE
  }
  return CARD_HEIGHT
}

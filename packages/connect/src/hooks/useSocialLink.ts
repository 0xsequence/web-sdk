'use client'

import { useSocialLinkContext } from '../contexts/SocialLink.js'

export const useSocialLink = () => {
  const { isSocialLinkOpen, waasConfigKey, setIsSocialLinkOpen } = useSocialLinkContext()

  return { isSocialLinkOpen, waasConfigKey, setIsSocialLinkOpen }
}

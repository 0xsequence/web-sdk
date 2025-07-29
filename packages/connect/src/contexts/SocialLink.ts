import { createGenericContext } from '@0xsequence/common'

type SocialLinkContext = {
  waasConfigKey: string
  isSocialLinkOpen: boolean
  setIsSocialLinkOpen: (isSocialLinkOpen: boolean) => void
}

const [useSocialLinkContext, SocialLinkContextProvider] = createGenericContext<SocialLinkContext>()

export { SocialLinkContextProvider, useSocialLinkContext }

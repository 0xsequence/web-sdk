import { createGenericContext } from './genericContext.js'

type SocialLinkContext = {
  waasConfigKey: string
  isSocialLinkOpen: boolean
  setIsSocialLinkOpen: (isSocialLinkOpen: boolean) => void
}

const [useSocialLinkContext, SocialLinkContextProvider] = createGenericContext<SocialLinkContext>()

export { SocialLinkContextProvider, useSocialLinkContext }

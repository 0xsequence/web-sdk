import { KitConfig } from '../types'
import { createGenericContext } from '../utils'

export const [useKitConfig, KitConfigContextProvider] = createGenericContext<KitConfig>()

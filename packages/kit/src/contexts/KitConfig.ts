import { KitConfig } from '../components/KitProvider'
import { createGenericContext } from '../utils'

export const [useKitConfig, KitConfigContextProvider] = createGenericContext<KitConfig>()

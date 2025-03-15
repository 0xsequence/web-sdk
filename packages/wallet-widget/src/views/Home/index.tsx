import { IntegratedWallet } from './components/IntegratedWallet'

export { SearchTokens } from '../Search/SearchTokens'
export { SearchCollectibles } from '../Search/SearchCollectibles'

export const Home = () => {
  return (
    <div className="flex px-4 pb-5 gap-4 flex-col">
      <IntegratedWallet />
    </div>
  )
}

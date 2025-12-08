import { ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'

interface CountriesResult {
  response: Country[]
}

interface Country {
  alpha2: string
  alpha3: string
  isAllowed: boolean
  isLightKycAllowed: boolean
  name: string
  supportedDocuments: string[]
  currencyCode: string
  partners: Partner[]
}

interface Partner {
  name: string
  isCardPayment: boolean
  currencyCode: string
}

export const fetchTransakSupportedCountries = async () => {
  const res = await fetch('https://api.transak.com/api/v2/countries')
  const data = (await res.json()) as CountriesResult

  return data.response.filter(x => x.isAllowed).map(x => x.alpha2)
}

interface GetCurrencyCodeParams {
  chainId: number
  currencyAddress: string
  defaultCurrencyCode: string
}

export const getCurrencyCode = ({ chainId, currencyAddress, defaultCurrencyCode }: GetCurrencyCodeParams) => {
  const currencyCodeByAddress: { [chainId: number]: { [currencyAddress: string]: string | undefined } | undefined } = {
    [ChainId.SEPOLIA]: {
      [zeroAddress]: 'ETH'
    }
  }

  const foundCurrencyAddress = currencyCodeByAddress?.[chainId]?.[currencyAddress.toLowerCase()]

  return foundCurrencyAddress || defaultCurrencyCode
}

interface ProxyByChainId {
  [key: number]: string
}

const chainIdToProxyAddressMapping: ProxyByChainId = {
  [ChainId.MAINNET]: '0xab88cd272863b197b48762ea283f24a13f6586dd'.toLowerCase(),
  [ChainId.SEPOLIA]: '0xD84aC4716A082B1F7eCDe9301aA91A7c4B62ECd7'.toLowerCase(),
  [ChainId.POLYGON]: '0x4A598B7eC77b1562AD0dF7dc64a162695cE4c78A'.toLowerCase(),
  [ChainId.POLYGON_AMOY]: '0xCB9bD5aCD627e8FcCf9EB8d4ba72AEb1Cd8Ff5EF'.toLowerCase(),
  [ChainId.BSC]: '0x4A598B7eC77b1562AD0dF7dc64a162695cE4c78A'.toLowerCase(),
  [ChainId.BSC_TESTNET]: '0x0E9539455944BE8a307bc43B0a046613a1aD6732'.toLowerCase(),
  [ChainId.ARBITRUM]: '0x4A598B7eC77b1562AD0dF7dc64a162695cE4c78A'.toLowerCase(),
  [ChainId.ARBITRUM_SEPOLIA]: '0x489F56e3144FF03A887305839bBCD20FF767d3d1'.toLowerCase(),
  [ChainId.OPTIMISM]: '0x4A598B7eC77b1562AD0dF7dc64a162695cE4c78A'.toLowerCase(),
  [ChainId.OPTIMISM_SEPOLIA]: '0xCB9bD5aCD627e8FcCf9EB8d4ba72AEb1Cd8Ff5EF'.toLowerCase(),
  [ChainId.IMMUTABLE_ZKEVM]: '0x8b83dE7B20059864C479640CC33426935DC5F85b'.toLowerCase(),
  [ChainId.IMMUTABLE_ZKEVM_TESTNET]: '0x489F56e3144FF03A887305839bBCD20FF767d3d1'.toLowerCase(),
  [ChainId.BASE]: '0x8b83dE7B20059864C479640CC33426935DC5F85b'.toLowerCase(),
  [ChainId.BASE_SEPOLIA]: '0xCB9bD5aCD627e8FcCf9EB8d4ba72AEb1Cd8Ff5EF'.toLowerCase()
}

export const getTransakProxyAddress = (chainId: number): string | undefined => {
  const proxyAddress = chainIdToProxyAddressMapping[chainId]
  return proxyAddress
}

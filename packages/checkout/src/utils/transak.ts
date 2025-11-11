import { ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'

export const TRANSAK_PROXY_ADDRESS = '0x4a598b7ec77b1562ad0df7dc64a162695ce4c78a'

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

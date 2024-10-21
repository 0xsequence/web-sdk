import { AddFundsSettings } from '../contexts'

export const TRANSAK_API_KEY = '5911d9ec-46b5-48fa-a755-d59a715ff0cf'

export const getTransakLink = (addFundsSettings: AddFundsSettings) => {
  const defaultNetworks = 'ethereum,mainnet,arbitrum,optimism,polygon,polygonzkevm,zksync,base,bnb,oasys,astar,avaxcchain'

  interface Options {
    [index: string]: string | undefined
  }

  const options: Options = {
    apiKey: TRANSAK_API_KEY,
    referrerDomain: window.location.origin,
    walletAddress: addFundsSettings.walletAddress,
    fiatAmount: addFundsSettings?.fiatAmount,
    fiatCurrency: addFundsSettings?.fiatCurrency,
    disableWalletAddressForm: 'true',
    defaultFiatAmount: addFundsSettings?.defaultFiatAmount || '50',
    defaultCryptoCurrency: addFundsSettings?.defaultCryptoCurrency || 'USDC',
    cryptoCurrencyList: addFundsSettings?.cryptoCurrencyList,
    networks: addFundsSettings?.networks || defaultNetworks
  }

  const url = new URL('https://global.transak.com')
  Object.keys(options).forEach(k => {
    const option = options[k]
    if (option) {
      url.searchParams.append(k, option)
    }
  })

  return url.href
}

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

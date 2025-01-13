import { AddFundsSettings } from '../contexts'

export const TRANSAK_API_KEY = '5911d9ec-46b5-48fa-a755-d59a715ff0cf'
export const TRANSAK_API_KEY_STAGING = 'c20f2a0e-fe6a-4133-8fa7-77e9f84edf98'
export const TRANSAK_PROXY_ADDRESS = '0x4a598b7ec77b1562ad0df7dc64a162695ce4c78a'

const TransakUrlProd = 'https://global.transak.com';
const TransakUrlSandbox = 'https://global-stg.transak.com';

export const getTransakLink = (addFundsSettings: AddFundsSettings) => {
  const defaultNetworks =
    'ethereum,mainnet,arbitrum,optimism,polygon,polygonzkevm,zksync,base,bnb,oasys,astar,avaxcchain,immutablezkevm'

  interface Options {
    [index: string]: string | undefined
  }

  const url = new URL(process.env.DEBUG ? TransakUrlSandbox : TransakUrlProd);
  const apiKey = process.env.DEBUG ? TRANSAK_API_KEY_STAGING : TRANSAK_API_KEY;

  const options: Options = {
    apiKey: apiKey,
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

import type { AddFundsSettings } from '../contexts/AddFundsModal.js'

export const TRANSAK_PROXY_ADDRESS = '0x4a598b7ec77b1562ad0df7dc64a162695ce4c78a'

export const getTransakLink = (
  addFundsSettings: AddFundsSettings,
  { transakApiUrl, transakApiKey }: { transakApiUrl: string; transakApiKey: string }
) => {
  const defaultNetworks =
    'ethereum,mainnet,arbitrum,optimism,polygon,polygonzkevm,zksync,base,bnb,oasys,astar,avaxcchain,immutablezkevm'

  interface Options {
    [index: string]: string | undefined
  }

  const url = new URL(transakApiUrl)
  const apiKey = transakApiKey

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

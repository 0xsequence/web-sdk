import { ChainId } from '@0xsequence/network'
import { zeroAddress } from 'viem'

import type { AddFundsSettings } from '../contexts/AddFundsModal.js'

export const TRANSAK_PROXY_ADDRESS = '0x4a598b7ec77b1562ad0df7dc64a162695ce4c78a'

export const getTransakLink = (
  addFundsSettings: AddFundsSettings,
  { transakApiUrl, transakApiKey }: { transakApiUrl: string; transakApiKey: string }
) => {
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
    networks: addFundsSettings?.networks
  }

  Object.keys(options).forEach(k => {
    const option = options[k]
    if (option) {
      url.searchParams.append(k, option)
    }
  })

  return url.href
}

export const getTransakLinkFromSequenceApi = async (
  addFundsSettings: AddFundsSettings,
  transakApiUrl: string,
  projectAccessKey: string
) => {
  interface Options {
    [index: string]: string | boolean | undefined
  }

  const options: Options = {
    referrerDomain: window.location.origin,
    walletAddress: addFundsSettings.walletAddress,
    fiatAmount: addFundsSettings?.fiatAmount,
    fiatCurrency: addFundsSettings?.fiatCurrency,
    disableWalletAddressForm: true,
    defaultCryptoCurrency: addFundsSettings?.defaultCryptoCurrency,
    networks: addFundsSettings?.networks
  }

  const url = new URL(transakApiUrl)

  const data = {
    params: {
      referrerDomain: options.referrerDomain,
      cryptoCurrencyCode: options.defaultCryptoCurrency,
      fiatAmount: options?.fiatAmount,
      fiatCurrency: options?.fiatCurrency,
      network: options.networks ? (options.networks as string).split(',')[0].trim() : undefined,
      disableWalletAddressForm: options.disableWalletAddressForm,
      walletAddress: options.walletAddress
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': projectAccessKey
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    console.log('result', result)
    return result?.url
  } catch (error) {
    console.error('Error:', error)
  }
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

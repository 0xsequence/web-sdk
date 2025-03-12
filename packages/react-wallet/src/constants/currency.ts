export interface FiatCurrency {
  decimals: number
  name: {
    message: string
  }
  sign: string
  symbol: string
}

export const supportedFiatCurrencies: FiatCurrency[] = [
  { symbol: 'USD', sign: '$', name: { message: 'US Dollar' }, decimals: 2 },
  { symbol: 'CAD', sign: '$', name: { message: 'Canadian Dollar' }, decimals: 2 },
  { symbol: 'GBP', sign: '£', name: { message: 'British Pound Sterling' }, decimals: 2 },
  { symbol: 'EUR', sign: '€', name: { message: 'Euro' }, decimals: 2 },
  { symbol: 'CNY', sign: '¥', name: { message: 'Chinese Yuan' }, decimals: 2 },
  { symbol: 'JPY', sign: '¥', name: { message: 'Japanese Yen' }, decimals: 2 },
  { symbol: 'KRW', sign: '₩', name: { message: 'South Korean Won' }, decimals: 2 },
  { symbol: 'SGD', sign: '$', name: { message: 'Singapore Dollar' }, decimals: 2 },
  { symbol: 'CHF', sign: 'CHF ', name: { message: 'Swiss Franc' }, decimals: 2 },
  { symbol: 'AUD', sign: '$', name: { message: 'Australian Dollar' }, decimals: 2 },
  { symbol: 'NZD', sign: '$', name: { message: 'New Zealand Dollar' }, decimals: 2 },
  { symbol: 'SEK', sign: 'kr ', name: { message: 'Swedish Krona' }, decimals: 2 },
  { symbol: 'NOK', sign: 'kr ', name: { message: 'Norwegian Krone' }, decimals: 2 },
  { symbol: 'MXN', sign: '$', name: { message: 'Mexican Peso' }, decimals: 2 },
  { symbol: 'INR', sign: '₹', name: { message: 'Indian Rupee' }, decimals: 2 },
  { symbol: 'ZAR', sign: 'R ', name: { message: 'South African Rand' }, decimals: 2 },
  { symbol: 'TRY', sign: '₺', name: { message: 'Turkish Lira' }, decimals: 2 },
  { symbol: 'BRL', sign: 'R$', name: { message: 'Brazilian Real' }, decimals: 2 },
  { symbol: 'DKK', sign: 'kr ', name: { message: 'Danish Krone' }, decimals: 2 },
  { symbol: 'PLN', sign: 'zł ', name: { message: 'Polish Zloty' }, decimals: 2 },
  { symbol: 'THB', sign: '฿', name: { message: 'Thai Baht' }, decimals: 2 },
  { symbol: 'IDR', sign: 'Rp', name: { message: 'Indonesian Rupiah' }, decimals: 2 }
]

export const defaultFiatCurrency = supportedFiatCurrencies[0]

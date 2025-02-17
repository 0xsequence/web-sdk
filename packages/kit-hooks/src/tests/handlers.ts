import { HttpResponse, http } from 'msw'

export const handlers = [
  http.get('/hello', () => {
    return HttpResponse.text('ok', { status: 200 })
  }),

  http.post('*/GetNativeTokenBalance', async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(
      {
        balances: [
          {
            result: {
              accountAddress: body.accountAddress,
              balance: '158495082541645504'
            }
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetTokenBalancesSummary', async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(
      {
        page: {
          page: 1
        },
        balances: [
          {
            chainId: 1,
            error: 'none',
            results: [
              {
                contractType: 'ERC721',
                contractAddress: '0x0000000000000000000000000000000000000000',
                accountAddress: body.accountAddress,
                tokenID: '1',
                balance: '1',
                blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                blockNumber: 1,
                chainId: 1,
                uniqueCollectibles: '1',
                isSummary: true
              },
              {
                contractType: 'ERC721',
                contractAddress: '0x0000000000000000000000000000000000000000',
                accountAddress: body.accountAddress,
                tokenID: '1',
                balance: '1',
                blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                blockNumber: 1,
                chainId: 1,
                uniqueCollectibles: '1',
                isSummary: true
              }
            ]
          }
        ],
        nativeBalances: [
          {
            chainId: 1,
            error: 'none',
            results: [
              {
                accountAddress: body.accountAddress,
                balance: '158495082541645504',
                error: 'none'
              }
            ]
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetTokenBalancesDetails', async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(
      {
        page: {
          page: 1
        },
        balances: [
          {
            chainId: 1,
            error: 'none',
            results: [
              {
                contractType: 'ERC721',
                contractAddress: '0x0000000000000000000000000000000000000000',
                accountAddress: body.accountAddress,
                tokenID: '1',
                balance: '1',
                blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                blockNumber: 1,
                chainId: 1,
                uniqueCollectibles: '1',
                isSummary: true
              }
            ]
          }
        ],
        nativeBalances: [
          {
            chainId: 1,
            error: 'none',
            results: [
              {
                accountAddress: body.accountAddress,
                balance: '158495082541645504',
                error: 'none'
              }
            ]
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetTokenBalancesByContract', async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(
      {
        page: {
          page: 1
        },
        balances: [
          {
            chainId: 1,
            error: 'none',
            results: [
              {
                contractType: 'ERC721',
                contractAddress: '0x0000000000000000000000000000000000000000',
                accountAddress: body.accountAddress,
                tokenID: '1',
                balance: '1',
                blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                blockNumber: 1,
                chainId: 1,
                uniqueCollectibles: '1',
                isSummary: true
              }
            ]
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetTokenMetadata', async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(
      {
        page: {
          page: 1
        },
        tokenMetadata: [
          {
            contractType: 'ERC721',
            contractAddress: '0x0000000000000000000000000000000000000000',
            accountAddress: body.accountAddress,
            tokenID: '1',
            name: 'Test',
            symbol: 'TEST',
            image: 'https://example.com/image.png',
            description: 'Test description',
            chainId: 1,
            uniqueCollectibles: '1',
            isSummary: true
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetContractInfo', async () => {
    return HttpResponse.json(
      {
        contractInfo: {
          chainId: 1,
          address: '0x0000000000000000000000000000000000000000',
          name: 'Ether',
          type: 'ERC721',
          symbol: 'TEST',
          decimals: 18,
          logoURI: 'https://assets.sequence.info/images/networks/medium/1.webp',
          deployed: true,
          bytecodeHash: 'testhash',
          extensions: {
            link: 'https://example.com/link',
            description: 'Test description',
            ogImage: 'https://example.com/ogImage',
            ogName: 'Test',
            originChainId: 1,
            originAddress: '',
            blacklist: false,
            verified: true,
            verifiedBy: 'test',
            featured: true,
            private: false
          },
          updatedAt: '2021-01-01'
        }
      },
      { status: 200 }
    )
  }),

  http.post('*/GetTransactionHistory', async () => {
    return HttpResponse.json(
      {
        page: { page: 1 },
        transactions: [
          {
            txnHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            blockNumber: 1,
            blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            chainId: 1,
            timestamp: '2021-01-01'
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetExchangeRate', async () => {
    return HttpResponse.json(
      {
        exchangeRate: {
          value: 0.7
        }
      },
      { status: 200 }
    )
  }),

  http.post('*/GetCoinPrices', async () => {
    return HttpResponse.json({
      tokenPrices: [
        {
          token: { chainId: 1, contractAddress: '0x0000000000000000000000000000000000000000' },
          floorPrice: { value: 10, currency: 'USD' },
          buyPrice: { value: 10, currency: 'USD' },
          sellPrice: { value: 10, currency: 'USD' }
        }
      ]
    })
  }),

  http.post('*/getCollectiblePrices', async () => {
    return HttpResponse.json({
      tokenPrices: [
        {
          token: { chainId: 1, contractAddress: '0x0000000000000000000000000000000000000000' },
          floorPrice: { value: 10, currency: 'USD' },
          buyPrice: { value: 10, currency: 'USD' },
          sellPrice: { value: 10, currency: 'USD' }
        }
      ]
    })
  }),

  http.post('*/GetSwapPrices', async () => {
    return HttpResponse.json(
      {
        swapPrices: [
          {
            currencyAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
            currencyBalance: '180000000000000',
            price: '7351402238115',
            maxPrice: '7718972350021',
            transactionValue: '0'
          },
          {
            currencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            currencyBalance: '1478702455538610019',
            price: '64490918485610659',
            maxPrice: '67715464409891192',
            transactionValue: '67715464409891192'
          }
        ]
      },
      { status: 200 }
    )
  }),

  http.post('*/GetSwapQuote', async () => {
    return HttpResponse.json(
      {
        swapQuote: {
          currencyAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
          currencyBalance: '180000000000000',
          price: '7351402238115',
          maxPrice: '7718972350021',
          to: '0x0000000000000000000000000000000000000000',
          transactionData: '0x0000000000000000000000000000000000000000000000000000000000000000',
          transactionValue: '0',
          approveData: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
      },
      { status: 200 }
    )
  })
]

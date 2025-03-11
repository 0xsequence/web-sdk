export const abi = [
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_tokenIds',
        type: 'uint256[]'
      },
      {
        internalType: 'uint256[]',
        name: '_tokensBoughtAmounts',
        type: 'uint256[]'
      },
      {
        internalType: 'uint256',
        name: '_maxCurrency',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address'
      },
      {
        internalType: 'address[]',
        name: '_extraFeeRecipients',
        type: 'address[]'
      },
      {
        internalType: 'uint256[]',
        name: '_extraFeeAmounts',
        type: 'uint256[]'
      }
    ],
    name: 'buyTokens',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

export const messageToSign = 'Two roads diverged in a yellow wood'

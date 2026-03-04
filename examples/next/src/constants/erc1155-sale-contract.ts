export const ERC_1155_SALE_CONTRACT = [
  {
    type: 'function',
    name: 'globalSaleDetails',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IERC1155SaleFunctions.SaleDetails',
        components: [
          {
            name: 'cost',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'supplyCap',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'startTime',
            type: 'uint64',
            internalType: 'uint64'
          },
          {
            name: 'endTime',
            type: 'uint64',
            internalType: 'uint64'
          },
          {
            name: 'merkleRoot',
            type: 'bytes32',
            internalType: 'bytes32'
          }
        ]
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'tokenIds',
        type: 'uint256[]',
        internalType: 'uint256[]'
      },
      {
        name: 'amounts',
        type: 'uint256[]',
        internalType: 'uint256[]'
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes'
      },
      {
        name: 'expectedPaymentToken',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'maxTotal',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'proof',
        type: 'bytes32[]',
        internalType: 'bytes32[]'
      }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'paymentToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32'
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'tokenSaleDetails',
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IERC1155SaleFunctions.SaleDetails',
        components: [
          {
            name: 'cost',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'supplyCap',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'startTime',
            type: 'uint64',
            internalType: 'uint64'
          },
          {
            name: 'endTime',
            type: 'uint64',
            internalType: 'uint64'
          },
          {
            name: 'merkleRoot',
            type: 'bytes32',
            internalType: 'bytes32'
          }
        ]
      }
    ],
    stateMutability: 'view'
  }
]

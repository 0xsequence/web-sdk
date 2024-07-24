export const orderbookAbi = [
  {
    inputs: [
      { internalType: 'uint256', name: 'requestId', type: 'uint256' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256[]', name: 'additionalFees', type: 'uint256[]' },
      { internalType: 'address[]', name: 'additionalFeeRecipients', type: 'address[]' }
    ],
    name: 'acceptRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

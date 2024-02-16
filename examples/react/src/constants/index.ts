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

interface BottomPageLink {
  label: string
  url: string
}

export const bottomPageLinks: BottomPageLink[] = [
  {
    label: 'Terms',
    url: 'https://sequence.xyz/terms'
  },
  {
    label: 'About',
    url: 'https://github.com/0xsequence/kit'
  },
  {
    label: 'Blog',
    url: 'https://sequence.xyz/blog'
  },
  {
    label: 'Builder',
    url: 'https://sequence.build'
  },
  {
    label: 'Docs',
    url: 'https://docs.sequence.xyz/wallet/connectors/kit/kit/overview'
  }
]

interface SocialLinks {
  id: string
  url: string
  icon: string
}

export const socialLinks: SocialLinks[] = [
  {
    id: 'discord',
    url: 'https://discord.gg/sequence',
    icon: 'img/social/discord.svg'
  },
  {
    id: 'twitter',
    url: 'https://www.twitter.com/0xsequence',
    icon: 'img/social/twitter.svg'
  },
  {
    id: 'youtube',
    url: 'https://www.youtube.com/channel/UC1zHgUyV-doddTcnFNqt62Q',
    icon: 'img/social/youtube.svg'
  },
  {
    id: 'github',
    url: 'https://github.com/0xsequence',
    icon: 'img/social/github.svg'
  }
]

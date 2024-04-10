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

export const messageToSign = `Two roads diverged in a yellow wood,
Robert Frost poet

And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`

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

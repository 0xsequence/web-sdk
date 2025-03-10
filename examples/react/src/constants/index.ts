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

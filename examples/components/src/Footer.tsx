import { Button, Image, Text } from '@0xsequence/design-system'

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
    url: 'https://github.com/0xsequence/web-sdk'
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
    url: 'https://docs.sequence.xyz/solutions/wallets/sequence-kit/overview'
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
    icon: 'images/discord.svg'
  },
  {
    id: 'twitter',
    url: 'https://www.twitter.com/0xsequence',
    icon: 'images/twitter.svg'
  },
  {
    id: 'youtube',
    url: 'https://www.youtube.com/channel/UC1zHgUyV-doddTcnFNqt62Q',
    icon: 'images/youtube.svg'
  },
  {
    id: 'github',
    url: 'https://github.com/0xsequence',
    icon: 'images/github.svg'
  }
]

export const Footer = () => {
  const onClickLinkUrl = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url)
    }
  }

  const Links = () => {
    return (
      <div className="flex flex-row gap-4">
        {bottomPageLinks.map((link, index) => (
          <Button
            className="flex gap-4"
            variant="text"
            onClick={() => onClickLinkUrl(link.url)}
            key={index}
            label={<Text variant="small">{link.label}</Text>}
          />
        ))}
      </div>
    )
  }

  const Socials = () => {
    return (
      <div className="flex gap-4 justify-center items-center">
        {socialLinks.map((socialLink, index) => {
          return (
            <div
              className="cursor-pointer"
              key={index}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(socialLink.url)
                }
              }}
            >
              <Image className="h-3" src={socialLink.icon} alt={socialLink.id} disableAnimation />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-[60px] flex p-5 fixed bottom-0 w-full justify-between bg-background-overlay backdrop-blur-md border-t-1 border-t-[#222]">
      <Links />
      <Socials />
    </div>
  )
}

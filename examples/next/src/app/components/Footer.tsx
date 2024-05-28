import { Box, Button, Image, Text, useTheme } from '@0xsequence/design-system'
import React from 'react'

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
    icon: 'discord.svg'
  },
  {
    id: 'twitter',
    url: 'https://www.twitter.com/0xsequence',
    icon: 'twitter.svg'
  },
  {
    id: 'youtube',
    url: 'https://www.youtube.com/channel/UC1zHgUyV-doddTcnFNqt62Q',
    icon: 'youtube.svg'
  },
  {
    id: 'github',
    url: 'https://github.com/0xsequence',
    icon: 'github.svg'
  }
]

export const Footer = () => {
  const { theme } = useTheme()

  const onClickLinkUrl = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url)
    }
  }

  const Links = () => {
    return (
      <Box flexDirection="row" gap="4">
        {bottomPageLinks.map((link, index) => (
          <Button
            variant="text"
            onClick={() => onClickLinkUrl(link.url)}
            key={index}
            gap="4"
            label={<Text variant="small">{link.label}</Text>}
          />
        ))}
      </Box>
    )
  }

  const Socials = () => {
    return (
      <Box gap="4" justifyContent="center" alignItems="center">
        {socialLinks.map((socialLink, index) => {
          return (
            <Box
              key={index}
              cursor="pointer"
              opacity={{ hover: '80' }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(socialLink.url)
                }
              }}
            >
              <Image
                height="3"
                src={socialLink.icon}
                alt={socialLink.id}
                style={{
                  filter: theme === 'dark' ? 'invert(0)' : 'invert(1)'
                }}
                disableAnimation
              />
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <Box
      padding="5"
      style={{ height: '60px', borderTop: '1px solid #222' }}
      position="fixed"
      bottom="0"
      width="full"
      justifyContent="space-between"
      background="backgroundOverlay"
      backdropFilter="blur"
    >
      <Links />
      <Socials />
    </Box>
  )
}

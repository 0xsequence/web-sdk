import { Box, Image, Text, useTheme } from '@0xsequence/design-system'
import React from 'react'

import { bottomPageLinks, socialLinks } from '../constants'

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
          <Box
            key={index}
            onClick={() => onClickLinkUrl(link.url)}
            opacity={{ hover: '80' }}
            cursor="pointer"
            userSelect="none"
            gap="4"
          >
            <Text fontWeight="normal" fontSize="small" color="text50">
              {link.label}
            </Text>
          </Box>
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
              opacity={{ hover: '80' }}
              cursor="pointer"
              userSelect="none"
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

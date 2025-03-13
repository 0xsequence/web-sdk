'use client'

import { isDevSequenceApis } from '@0xsequence/react-connect'

export const EnvironmentSetter = () => {
  globalThis.__WEB_SDK_DEV_GLOBAL__ = false

  console.log('is dev environment: ', isDevSequenceApis())

  return null
}

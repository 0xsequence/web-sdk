'use client'

import type { SequenceClient } from '@0xsequence/provider'
import type { Dispatch, SetStateAction } from 'react'

import { createGenericContext } from './genericContext.js'

type AnalyticsContext = {
  setAnalytics: Dispatch<SetStateAction<SequenceClient['analytics']>>
  analytics: SequenceClient['analytics']
}

const [useAnalyticsContext, AnalyticsContextProvider] = createGenericContext<AnalyticsContext>()

export { AnalyticsContextProvider, useAnalyticsContext }

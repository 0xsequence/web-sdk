'use client'

import { SequenceClient } from '@0xsequence/provider'
import React from 'react'

import { createGenericContext } from './genericContext'

type AnalyticsContext = {
  setAnalytics: React.Dispatch<React.SetStateAction<SequenceClient['analytics']>>
  analytics: SequenceClient['analytics']
}

const [useAnalyticsContext, AnalyticsContextProvider] = createGenericContext<AnalyticsContext>()
export { useAnalyticsContext, AnalyticsContextProvider }

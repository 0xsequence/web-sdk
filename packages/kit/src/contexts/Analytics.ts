'use client'

import React from 'react'

import { createGenericContext } from './genericContext'

import { SequenceClient } from '@0xsequence/provider'

type AnalyticsContext = {
  setAnalytics: React.Dispatch<React.SetStateAction<SequenceClient['analytics']>>
  analytics: SequenceClient['analytics']
}

const [useAnalyticsContext, AnalyticsContextProvider] = createGenericContext<AnalyticsContext>()
export { useAnalyticsContext, AnalyticsContextProvider }

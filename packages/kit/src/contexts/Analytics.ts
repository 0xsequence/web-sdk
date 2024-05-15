import { sequence } from '0xsequence'
import React from 'react'

import { createGenericContext } from './genericContext'

type AnalyticsContext = {
  setAnalytics: React.Dispatch<React.SetStateAction<sequence.SequenceClient['analytics']>>
  analytics: sequence.SequenceClient['analytics']
}

const [useAnalyticsContext, AnalyticsContextProvider] = createGenericContext<AnalyticsContext>()
export { useAnalyticsContext, AnalyticsContextProvider }

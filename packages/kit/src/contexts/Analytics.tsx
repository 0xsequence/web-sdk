import { SequenceClient } from '0xsequence/dist/declarations/src/provider'
import React from 'react'

import { createGenericContext } from '../utils'

type AnalyticsContext = {
  setAnalytics: React.Dispatch<React.SetStateAction<SequenceClient['analytics']>>
  analytics: SequenceClient['analytics']
}

const [useAnalyticsContext, AnalyticsContextProvider] = createGenericContext<AnalyticsContext>()
export { useAnalyticsContext, AnalyticsContextProvider }

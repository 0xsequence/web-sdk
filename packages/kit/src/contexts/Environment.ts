'use client'

import React from 'react'

import { createGenericContext } from './genericContext'

type EnvironmentContext = {
  setIsEnabledDevSequenceApis: React.Dispatch<React.SetStateAction<boolean>>
  isEnabledDevSequenceApis: boolean
  setIsEnabledDevTransak: React.Dispatch<React.SetStateAction<boolean>>
  isEnabledDevTransak: boolean
  setIsEnabledDevSardine: React.Dispatch<React.SetStateAction<boolean>>
  isEnabledDevSardine: boolean
  devProjectAccessKey: string
  setDevProjectAccessKey: React.Dispatch<React.SetStateAction<string>>
}

const [useEnvironmentContext, EnvironmentContextProvider] = createGenericContext<EnvironmentContext>()
export { useEnvironmentContext, EnvironmentContextProvider }

import { stringTemplate } from '@0xsequence/network'

import { SERVICES } from './consts.js'

export type Environment = 'development' | 'production' | 'next'

/**
 * Get the environment prefix for API URLs
 */
export const getPrefix = (env: Environment): string => {
  switch (env) {
    case 'development':
      return 'dev-'
    case 'production':
      return ''
    case 'next':
      return 'next-'
  }
}

/**
 * Get the environment postfix for API URLs
 */
export const getPostfix = (env: Environment): string => {
  switch (env) {
    case 'development':
      return '-dev'
    case 'production':
      return ''
    case 'next':
      return '-next'
  }
}

/**
 * Determine environment based on API URL
 */
export const getEnvironmentFromApiUrl = (apiUrl: string): Environment => {
  if (apiUrl.includes('dev-api.sequence')) {
    return 'development'
  } else if (apiUrl.includes('next-api.sequence')) {
    return 'next'
  }
  return 'production'
}

/**
 * Generate Sequence API URL for the given environment
 */
export const sequenceApiURL = (env: Environment): string => {
  const prefix = getPrefix(env)
  return stringTemplate(SERVICES.sequenceApi, { prefix })
}

/**
 * Generate Trails API URL for the given environment
 */
export const trailsApiURL = (env: Environment): string => {
  const prefix = getPrefix(env)
  const postfix = getPostfix(env)
  return stringTemplate(SERVICES.trailsApi, { prefix, postfix })
}

/**
 * Generate Sequence Indexer URL for the given environment
 */
export const sequenceIndexerURL = (env: Environment): string => {
  const prefix = getPrefix(env)
  return stringTemplate(SERVICES.indexerGateway, { prefix })
}

/**
 * Generate Sequence Node Gateway URL for the given environment
 */
export const sequenceNodeGatewayURL = (env: Environment): string => {
  const prefix = getPrefix(env)
  return stringTemplate(SERVICES.nodeGateway, { prefix })
}

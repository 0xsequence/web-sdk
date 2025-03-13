declare global {
  var __WEB_SDK_DEV_GLOBAL__: boolean | undefined
  var __WEB_SDK_DEV_SARDINE__: boolean | undefined
  var __WEB_SDK_DEV_TRANSAK__: boolean | undefined
  var __WEB_SDK_DEV_SEQUENCE_APIS__: boolean | undefined
  var __WEB_SDK_DEV_SARDINE_PROJECT_ACCESS_KEY__: string | undefined
}

export const DEV_GLOBAL = !!globalThis.__WEB_SDK_DEV_GLOBAL__
export const DEV_SARDINE = !!globalThis.__WEB_SDK_DEV_SARDINE__
export const DEV_TRANSAK = !!globalThis.__WEB_SDK_DEV_TRANSAK__
export const DEV_SEQUENCE_APIS = !!globalThis.__WEB_SDK_DEV_SEQUENCE_APIS__
export const DEV_SARDINE_PROJECT_ACCESS_KEY = globalThis.__WEB_SDK_DEV_SARDINE_PROJECT_ACCESS_KEY__

export const isDev = () => {
  return DEV_GLOBAL
}

export const isDevSardine = () => {
  return DEV_SARDINE || isDev()
}

export const isDevTransak = () => {
  return DEV_TRANSAK || isDev()
}

export const isDevSequenceApis = () => {
  return DEV_SEQUENCE_APIS || isDev()
}

export const getDevSardineProjectAccessKey = (prodProjectAccessKey: string) => {
  return DEV_SARDINE_PROJECT_ACCESS_KEY || prodProjectAccessKey
}

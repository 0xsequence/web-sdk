declare global {
  var __WEB_SDK_DEV_GLOBAL__: boolean | undefined
  var __WEB_SDK_DEV_SARDINE__: boolean | undefined
  var __WEB_SDK_DEV_TRANSAK__: boolean | undefined
  var __WEB_SDK_DEV_SEQUENCE_APIS__: boolean | undefined
  var __WEB_SDK_DEV_SARDINE_PROJECT_ACCESS_KEY__: string | undefined
}

export const isDev = () => {
  return !!globalThis.__WEB_SDK_DEV_GLOBAL__
}

export const isDevSardine = () => {
  return !!globalThis.__WEB_SDK_DEV_SARDINE__ || isDev()
}

export const isDevTransak = () => {
  return !!globalThis.__WEB_SDK_DEV_TRANSAK__ || isDev()
}

export const isDevSequenceApis = () => {
  return !!globalThis.__WEB_SDK_DEV_SEQUENCE_APIS__ || isDev()
}

export const getDevSardineProjectAccessKey = (prodProjectAccessKey: string) => {
  return globalThis.__WEB_SDK_DEV_SARDINE_PROJECT_ACCESS_KEY__ || prodProjectAccessKey
}

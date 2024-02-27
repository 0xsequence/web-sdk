const PREFIX = '@kit'
const SETTINGS = 'settings'
const THEME = 'theme'
const ETHAUTH_PROOF = 'ethAuthProof'
const ETHAUTH_SETTINGS = 'ethAuthSettings'
const PROJECT_ACCESS_KEY = 'projectAccessKey'
const WAAS_GOOGLE_CLIENT_ID = 'waasGoogleClientId'
const WAAS_GOOGLE_ID_TOKEN = 'waasGoogleIdToken'
const WAAS_APPLE_CLIENT_ID = 'waasAppleClientId'
const WAAS_APPLE_REDIRECT_URI = 'waasAppleRedirectURI'
const WAAS_APPLE_ID_TOKEN = 'waasAppleIdToken'
const WAAS_SESSION_HASH = 'waasSessionHash'
const WAAS_EMAIL_ID_TOKEN = 'waasEmailIdToken'
const WAAS_ACTIVE_LOGIN_TYPE = 'waasActiveLoginType'

export enum LocalStorageKey {
  Settings = `${PREFIX}.${SETTINGS}`,
  Theme = `${PREFIX}.${THEME}`,
  EthAuthProof = `${PREFIX}.${ETHAUTH_PROOF}`,
  EthAuthSettings = `${PREFIX}.${ETHAUTH_SETTINGS}`,
  ProjectAccessKey = `${PREFIX}.${PROJECT_ACCESS_KEY}`,
  WaasGoogleClientID = `${PREFIX}.${WAAS_GOOGLE_CLIENT_ID}`,
  WaasGoogleIdToken = `${PREFIX}.${WAAS_GOOGLE_ID_TOKEN}`,
  WaasAppleClientID = `${PREFIX}.${WAAS_APPLE_CLIENT_ID}`,
  WaasAppleRedirectURI = `${PREFIX}.${WAAS_APPLE_REDIRECT_URI}`,
  WaasAppleIdToken = `${PREFIX}.${WAAS_APPLE_ID_TOKEN}`,
  WaasSessionHash = `${PREFIX}.${WAAS_SESSION_HASH}`,
  WaasActiveLoginType = `${PREFIX}.${WAAS_ACTIVE_LOGIN_TYPE}`,
  WaasEmailIdToken = `${PREFIX}.${WAAS_EMAIL_ID_TOKEN}`
}

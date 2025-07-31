const PREFIX = '@kit'
const SETTINGS = 'settings'
const THEME = 'theme'
const ETHAUTH_PROOF = 'ethAuthProof'
const ETHAUTH_SETTINGS = 'ethAuthSettings'
const WAAS_GOOGLE_CLIENT_ID = 'waasGoogleClientId'
const WAAS_GOOGLE_ID_TOKEN = 'waasGoogleIdToken'
const WAAS_APPLE_CLIENT_ID = 'waasAppleClientId'
const WAAS_APPLE_REDIRECT_URI = 'waasAppleRedirectURI'
const WAAS_APPLE_ID_TOKEN = 'waasAppleIdToken'
const WAAS_X_CLIENT_ID = 'waasXClientId'
const WAAS_X_REDIRECT_URI = 'waasXRedirectURI'
const WAAS_EMAIL_ID_TOKEN = 'waasEmailIdToken'
const WAAS_ACTIVE_LOGIN_TYPE = 'waasActiveLoginType'
const WAAS_SIGN_IN_EMAIL = 'waasSignInEmail'
const SIGN_IN_EMAIL = 'signInEmail'
const WAAS_AUTH_URL = 'WaasEpicAuthUrl'
const WAAS_EPIC_ID_TOKEN = 'waasEpicIdToken'

// TODO: remove all of this.. we should not be storing these in local storage
export enum LocalStorageKey {
  Settings = `${PREFIX}.${SETTINGS}`,
  Theme = `${PREFIX}.${THEME}`,
  EthAuthProof = `${PREFIX}.${ETHAUTH_PROOF}`,
  EthAuthSettings = `${PREFIX}.${ETHAUTH_SETTINGS}`,
  WaasGoogleClientID = `${PREFIX}.${WAAS_GOOGLE_CLIENT_ID}`,
  WaasGoogleIdToken = `${PREFIX}.${WAAS_GOOGLE_ID_TOKEN}`,
  WaasAppleClientID = `${PREFIX}.${WAAS_APPLE_CLIENT_ID}`,
  WaasAppleRedirectURI = `${PREFIX}.${WAAS_APPLE_REDIRECT_URI}`,
  WaasAppleIdToken = `${PREFIX}.${WAAS_APPLE_ID_TOKEN}`,
  WaasXClientId = `${PREFIX}.${WAAS_X_CLIENT_ID}`,
  WaasXRedirectURI = `${PREFIX}.${WAAS_X_REDIRECT_URI}`,
  WaasActiveLoginType = `${PREFIX}.${WAAS_ACTIVE_LOGIN_TYPE}`,
  WaasEmailIdToken = `${PREFIX}.${WAAS_EMAIL_ID_TOKEN}`,
  WaasSignInEmail = `${PREFIX}.${WAAS_SIGN_IN_EMAIL}`,
  SignInEmail = `${PREFIX}.${SIGN_IN_EMAIL}`,
  WaasEpicAuthUrl = `${PREFIX}.${WAAS_AUTH_URL}`,
  WaasEpicIdToken = `${PREFIX}.${WAAS_EPIC_ID_TOKEN}`
}

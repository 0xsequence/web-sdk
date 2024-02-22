const PREFIX = '@kit'
const SETTINGS = 'settings'
const THEME = 'theme'
const ETHAUTH_PROOF = 'ethAuthProof'
const ETHAUTH_SETTINGS = 'ethAuthSettings'
const PROJECT_ACCESS_KEY = 'projectAccessKey'
const GOOGLE_CLIENT_ID = 'googleClientId'
const GOOGLE_ID_TOKEN = 'googleIdToken'
const WAAS_SESSION_HASH = 'waasSessionHash'
const ACTIVE_WAAS_OPTION = 'activeWaasOption'

export enum LocalStorageKey {
  Settings = `${PREFIX}.${SETTINGS}`,
  Theme = `${PREFIX}.${THEME}`,
  EthAuthProof = `${PREFIX}.${ETHAUTH_PROOF}`,
  EthAuthSettings = `${PREFIX}.${ETHAUTH_SETTINGS}`,
  ProjectAccessKey = `${PREFIX}.${PROJECT_ACCESS_KEY}`,
  GoogleClientID = `${PREFIX}.${GOOGLE_CLIENT_ID}`,
  GoogleIDToken = `${PREFIX}.${GOOGLE_ID_TOKEN}`,
  WaasSessionHash = `${PREFIX}.${WAAS_SESSION_HASH}`,
  ActiveWaasOption = `${PREFIX}.${ACTIVE_WAAS_OPTION}`
}

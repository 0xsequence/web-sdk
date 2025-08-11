const PREFIX = '@kit'
const SETTINGS = 'settings'
const THEME = 'theme'
const ETHAUTH_PROOF = 'ethAuthProof'
const ETHAUTH_SETTINGS = 'ethAuthSettings'

const WAAS_ACTIVE_LOGIN_TYPE = 'V3ActiveLoginType'

const SIGN_IN_EMAIL = 'signInEmail'

// TODO: remove all of this.. we should not be storing these in local storage
export enum LocalStorageKey {
  Settings = `${PREFIX}.${SETTINGS}`,
  Theme = `${PREFIX}.${THEME}`,
  EthAuthProof = `${PREFIX}.${ETHAUTH_PROOF}`,
  EthAuthSettings = `${PREFIX}.${ETHAUTH_SETTINGS}`,

  V3ActiveLoginType = `${PREFIX}.${WAAS_ACTIVE_LOGIN_TYPE}`,

  SignInEmail = `${PREFIX}.${SIGN_IN_EMAIL}`
}

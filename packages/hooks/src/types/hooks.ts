export interface HooksOptions {
  disabled?: boolean
  retry?: boolean
}

export interface BalanceHookOptions extends HooksOptions {
  hideCollectibles?: boolean
}

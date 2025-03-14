import '@0xsequence/provider'

declare module '@0xsequence/provider' {
  export enum AnalyticsEventType {
    // Kit specific events
    LINK_WALLET = 'LINK_WALLET',
    UNLINK_WALLET = 'UNLINK_WALLET'
  }
}

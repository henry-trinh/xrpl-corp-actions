export type ActionType = "dividend" | "split"
export type ActionStatus = "draft" | "announced" | "snapshotted" | "paid"
export type PayoutStatus = "pending" | "sent" | "failed"

export interface CorporateAction {
  id: string
  company: string // e.g., "DemoCo"
  token: string // e.g., "DIS.Share"
  type: ActionType
  recordAt: string // ISO datetime (UTC)
  payableAt: string // ISO datetime (UTC)
  payoutPerShare?: number // XRP (for dividends)
  splitRatio?: string // "2:1" (for splits)
  memoJson: Record<string, unknown>
  memoHex: string // hex-encoded JSON preview
  xrplAnnounceTx?: string // placeholder explorer link
  status: ActionStatus
  createdBy: string
  createdAt: string // ISO datetime
}

export interface Snapshot {
  id: string
  actionId: string
  takenAt: string
  holders: Array<{
    address: string
    balance: number
    entitlementXrp?: number
  }>
  totalHolders: number
  totalShares: number
  totalEntitlementXrp?: number
}

export interface Payout {
  id: string
  actionId: string
  address: string
  amountXrp: number
  status: PayoutStatus
  txHash?: string
  memoJson: Record<string, unknown>
  createdAt: string
}

export interface TimelineEvent {
  id: string
  type: "announcement" | "snapshot" | "payout"
  actionId: string
  company: string
  token: string
  timestamp: string
  description: string
}

export interface Holdings {
  address: string
  tokens: Array<{
    symbol: string
    balance: number
  }>
  upcomingActions: CorporateAction[]
  payoutHistory: Payout[]
}

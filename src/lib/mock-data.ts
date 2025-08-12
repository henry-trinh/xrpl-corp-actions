import type { CorporateAction, Snapshot, Payout, TimelineEvent } from "@/types"

export const mockActions: CorporateAction[] = [
  {
    id: "action-1",
    company: "DemoCo",
    token: "DIS.Share",
    type: "dividend",
    recordAt: "2024-01-15T16:00:00.000Z",
    payableAt: "2024-01-22T16:00:00.000Z",
    payoutPerShare: 5,
    memoJson: {
      type: "dividend",
      company: "DemoCo",
      token: "DIS.Share",
      payoutPerShare: 5,
      recordDate: "2024-01-15T16:00:00.000Z",
    },
    memoHex:
      "7b2274797065223a226469766964656e64222c22636f6d70616e79223a2244656d6f436f222c22746f6b656e223a224449532e5368617265222c22706179",
    xrplAnnounceTx: "https://testnet.xrpl.org/transactions/ABC123",
    status: "announced",
    createdBy: "issuer@democo.com",
    createdAt: "2024-01-10T10:00:00.000Z",
  },
  {
    id: "action-2",
    company: "DemoCo",
    token: "DIS.Share",
    type: "split",
    recordAt: "2024-02-01T16:00:00.000Z",
    payableAt: "2024-02-05T16:00:00.000Z",
    splitRatio: "2:1",
    memoJson: {
      type: "split",
      company: "DemoCo",
      token: "DIS.Share",
      splitRatio: "2:1",
      recordDate: "2024-02-01T16:00:00.000Z",
    },
    memoHex:
      "7b2274797065223a2273706c6974222c22636f6d70616e79223a2244656d6f436f222c22746f6b656e223a224449532e5368617265222c2273706c69",
    status: "draft",
    createdBy: "issuer@democo.com",
    createdAt: "2024-01-25T14:30:00.000Z",
  },
]

export const mockSnapshots: Snapshot[] = [
  {
    id: "snapshot-1",
    actionId: "action-1",
    takenAt: "2024-01-15T16:00:00.000Z",
    holders: [
      { address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH", balance: 100, entitlementXrp: 500 },
      { address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh", balance: 250, entitlementXrp: 1250 },
      { address: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w", balance: 75, entitlementXrp: 375 },
      { address: "rDNvpqoKbPJpKjQzQqKqzQqKqzQqKqzQqK", balance: 150, entitlementXrp: 750 },
    ],
    totalHolders: 4,
    totalShares: 575,
    totalEntitlementXrp: 2875,
  },
]

export const mockPayouts: Payout[] = [
  {
    id: "payout-1",
    actionId: "action-1",
    address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    amountXrp: 500,
    status: "sent",
    txHash: "DEF456",
    memoJson: { dividend: true, amount: 500 },
    createdAt: "2024-01-22T16:05:00.000Z",
  },
  {
    id: "payout-2",
    actionId: "action-1",
    address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    amountXrp: 1250,
    status: "sent",
    txHash: "GHI789",
    memoJson: { dividend: true, amount: 1250 },
    createdAt: "2024-01-22T16:06:00.000Z",
  },
]

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "event-1",
    type: "announcement",
    actionId: "action-1",
    company: "DemoCo",
    token: "DIS.Share",
    timestamp: "2024-01-10T10:00:00.000Z",
    description: "Dividend announced: 5 XRP per share",
  },
  {
    id: "event-2",
    type: "snapshot",
    actionId: "action-1",
    company: "DemoCo",
    token: "DIS.Share",
    timestamp: "2024-01-15T16:00:00.000Z",
    description: "Snapshot taken: 575 shares held by 4 addresses",
  },
]

export const mockHolders = [
  { address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH", balance: 100 },
  { address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh", balance: 250 },
  { address: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w", balance: 75 },
  { address: "rDNvpqoKbPJpKjQzQqKqzQqKqzQqKqzQqK", balance: 150 },
]

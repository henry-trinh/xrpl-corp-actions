// src/lib/dev-store.ts

export type ActionStatus = "draft" | "announced" | "snapshotted" | "paid";

export interface Action {
  id: string;
  company: string;
  token: string;           // e.g., "DIS.Share"
  type: "dividend" | "split";
  recordAt: string;        // ISO
  payableAt: string;       // ISO
  payoutPerShare?: number;
  splitRatio?: string;
  memoJson?: Record<string, unknown>;
  memoHex?: string;
  xrplAnnounceTx?: string;
  status: ActionStatus;
  createdAt: string;       // ISO
}

export interface Snapshot {
  id: string;
  actionId: string;
  takenAt: string;
  holders: Array<{ address: string; balance: number; entitlementXrp?: number }>;
  totalHolders?: number;
  totalShares?: number;
  totalEntitlementXrp?: number;
}

export interface PayoutRow {
  id: string;
  actionId: string;
  address: string;
  amountXrp: number;
  status: "pending" | "sent" | "failed";
  txHash?: string;
  memoJson?: Record<string, unknown>;
  createdAt: string;
}

type Store = {
  actions: Action[];
  snapshots: Snapshot[];
  payouts: PayoutRow[];
};

// --- Global singleton to survive module reloads in dev ---
declare global {
  // eslint-disable-next-line no-var
  var __XRPL_DEV_STORE__: Store | undefined;
}

const _store: Store =
  globalThis.__XRPL_DEV_STORE__ ??
  { actions: [], snapshots: [], payouts: [] };

if (!globalThis.__XRPL_DEV_STORE__) {
  globalThis.__XRPL_DEV_STORE__ = _store;
}

// ------------------ API helpers ------------------

export function listActions(): Action[] {
  return [..._store.actions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getAction(id: string): Action | undefined {
  return _store.actions.find(a => a.id === id);
}

export function createAction(a: Action): Action {
  _store.actions.unshift(a);
  return a;
}

export function setActionStatus(id: string, status: ActionStatus) {
  const a = getAction(id);
  if (a) a.status = status;
}

export function createSnapshot(s: Snapshot): Snapshot {
  _store.snapshots.unshift(s);
  setActionStatus(s.actionId, "snapshotted");
  return s;
}

export function getLatestSnapshotForAction(actionId: string): Snapshot | undefined {
  return _store.snapshots.find(s => s.actionId === actionId);
}

export function listSnapshots(): Snapshot[] {
  return [..._store.snapshots];
}

export function addPayout(row: PayoutRow) {
  _store.payouts.push(row);
}

export function listPayoutsForAction(actionId: string): PayoutRow[] {
  return _store.payouts.filter(p => p.actionId === actionId);
}

export function markActionPaid(actionId: string) {
    setActionStatus(actionId, "paid");
  }

export function listAllPayouts(): PayoutRow[] {
  return [..._store.payouts];
}

export function listAllSnapshots() {
    return _store.snapshots;
  }
  
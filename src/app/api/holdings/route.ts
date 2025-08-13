export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  listActions,
  getAction,
  getLatestSnapshotForAction,
  listPayoutsForAction,
} from "@/lib/dev-store";

/**
 * GET /api/holdings?address=r...
 * Aggregates a wallet's simulated "portfolio" from snapshots/payouts in the dev store.
 *
 * Response shape:
 * {
 *   address: string,
 *   tokens: Array<{ symbol: string; balance: number }>,
 *   upcomingActions: Array<{ id:string; company:string; token:string; type:string; recordAt:string; payableAt:string }>,
 *   payoutHistory: Array<{ id:string; actionId:string; amountXrp:number; status:"sent"|"failed"; txHash?:string; createdAt:string }>
 * }
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  // 1) Build token balances from the *latest snapshot per action*
  //    If the holder is present in that snapshot, add their balance under the action's token symbol.
  const tokenBalances = new Map<string, number>();

  for (const action of listActions()) {
    const snap = getLatestSnapshotForAction(action.id);
    if (!snap) continue;

    const holder = snap.holders.find(h => h.address === address);
    if (!holder) continue;

    const symbol = action.token; // e.g., "DIS.Share"
    const prev = tokenBalances.get(symbol) ?? 0;
    tokenBalances.set(symbol, prev + Number(holder.balance || 0));
  }

  const tokens = Array.from(tokenBalances.entries()).map(([symbol, balance]) => ({
    symbol,
    balance,
  }));

  // 2) Upcoming actions for tokens this address holds (record date in the future)
  const now = Date.now();
  const heldSymbols = new Set(tokens.map(t => t.symbol));
  const upcomingActions = listActions()
    .filter(a => {
      const recordAtMs = a.recordAt ? Date.parse(a.recordAt) : NaN;
      return heldSymbols.has(a.token) && Number.isFinite(recordAtMs) && recordAtMs > now;
    })
    .map(a => ({
      id: a.id,
      company: a.company,
      token: a.token,
      type: a.type,
      recordAt: a.recordAt,
      payableAt: a.payableAt,
    }));

  // 3) Payout history for this address (across all actions)
  //    We collect payouts per action and filter to this address.
  const payoutHistory = listActions()
    .flatMap(a => listPayoutsForAction(a.id))
    .filter(p => p.address === address)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(p => ({
      id: p.id,
      actionId: p.actionId,
      amountXrp: p.amountXrp,
      status: p.status,
      txHash: p.txHash,
      createdAt: p.createdAt,
    }));

  return NextResponse.json({
    address,
    tokens,
    upcomingActions,
    payoutHistory,
  });
}

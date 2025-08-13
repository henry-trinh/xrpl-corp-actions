export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSnapshot, getAction } from "@/lib/dev-store";

type Params = { params: { id: string } };

type HolderInput = { address: string; balance: number };

function isValidAddress(a?: string) {
  return !!a && a.startsWith("r") && a.length >= 25 && a.length <= 40;
}

export async function POST(request: Request, { params }: Params) {
  const actionId = params.id;
  const action = getAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  // Optional JSON body: { holders: [{ address, balance }, ...] }
  let body: { holders?: HolderInput[] } = {};
  try { body = await request.json(); } catch { /* no-op: treat as empty */ }

  // If no holders provided, include ANNOUNCE_DEST by default so your holdings page can show something.
  const defaultAddr = process.env.XRPL_ANNOUNCE_DEST;
  const holders: HolderInput[] =
    Array.isArray(body?.holders) && body.holders.length > 0
      ? body.holders
      : (isValidAddress(defaultAddr)
          ? [{ address: defaultAddr!, balance: 100 }] // demo balance
          : []);

  // Basic validation / sanitization
  const cleaned = holders
    .filter(h => isValidAddress(h.address))
    .map(h => ({ address: h.address, balance: Math.max(0, Number(h.balance) || 0) }))
    .filter(h => h.balance > 0);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "No valid holders supplied" }, { status: 400 });
  }

  // Compute entitlements for dividends (0 for splits in this simple PoC)
  const perShare = action.type === "dividend" ? Number(action.payoutPerShare || 0) : 0;

  const enriched = cleaned.map(h => ({
    ...h,
    entitlementXrp: Number((h.balance * perShare).toFixed(6)),
  }));

  const snapshot = {
    id: `snap-${Date.now()}`,
    actionId,
    takenAt: new Date().toISOString(),
    holders: enriched,
    totalHolders: enriched.length,
    totalShares: enriched.reduce((s, h) => s + h.balance, 0),
    totalEntitlementXrp: enriched.reduce((s, h) => s + (h.entitlementXrp || 0), 0),
  };

  // Persist in dev store (also flips action status to "snapshotted")
  createSnapshot(snapshot as any);

  return NextResponse.json(snapshot, { status: 201 });
}

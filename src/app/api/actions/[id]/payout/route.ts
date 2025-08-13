export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  getAction,
  getLatestSnapshotForAction,
  addPayout,
  markActionPaid,
} from "@/lib/dev-store";
import { payDividend } from "@/lib/xrpl";

type Params = { params: { id: string } };

export async function POST(_: Request, { params }: Params) {
  try {
    const actionId = params.id;
    const action = getAction(actionId);
    if (!action) return NextResponse.json({ error: "Action not found" }, { status: 404 });

    const snap = getLatestSnapshotForAction(actionId);
    if (!snap) return NextResponse.json({ error: "No snapshot found" }, { status: 400 });

    const perShare = action.type === "dividend" ? Number(action.payoutPerShare || 0) : 0;

    const results: Array<{
      id: string;
      actionId: string;
      address: string;
      amountXrp: number;
      status: "sent" | "failed";
      txHash?: string;
      createdAt: string;
    }> = [];

    for (const h of snap.holders) {
      const amountXrp = Number((h.balance * perShare).toFixed(6));
      if (amountXrp <= 0) continue;

      try {
        const memo = { actionId, reason: "dividend", shares: h.balance, amountXrp };
        const txHash = await payDividend(h.address, amountXrp, memo);

        const row = {
          id: `${actionId}_${h.address}_${Date.now()}`,
          actionId,
          address: h.address,
          amountXrp,
          status: "sent" as const,
          txHash,
          createdAt: new Date().toISOString(),
        };
        addPayout(row);
        results.push(row);
      } catch (e: any) {
        const row = {
          id: `${actionId}_${h.address}_${Date.now()}`,
          actionId,
          address: h.address,
          amountXrp,
          status: "failed" as const,
          createdAt: new Date().toISOString(),
        };
        addPayout(row);
        results.push(row);
      }
    }

    // Mark action paid if we sent at least one payout
    if (results.some(r => r.status === "sent")) {
      markActionPaid(actionId);
    }

    return NextResponse.json({ actionId, results });
  } catch (e: any) {
    console.error("Payout error:", e);
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 502 });
  }
}

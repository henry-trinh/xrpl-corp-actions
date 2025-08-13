export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  listActions,
  listAllSnapshots,
  listAllPayouts,
} from "@/lib/dev-store";

/**
 * GET /api/dashboard
 * Returns KPIs + a recent-activity timeline (announcements, snapshots, payouts)
 */
export async function GET() {
  const actions = listActions?.() ?? [];
  const snapshots = listAllSnapshots?.() ?? [];
  const payouts = listAllPayouts?.() ?? [];

  // ---- KPIs ----
  const announcementsPosted = actions.length;
  const snapshotsTaken = snapshots.length;

  const sentPayouts = payouts.filter((p: any) => p.status === "sent");
  const payoutsCompleted = sentPayouts.length;
  const totalXrpDistributed = sentPayouts.reduce(
    (sum: number, p: any) => sum + Number(p.amountXrp || 0),
    0
  );

  // ---- Timeline (latest first) ----
  type TimelineRow = {
    id: string;
    type: "announcement" | "snapshot" | "payout";
    company?: string;
    token?: string;
    description: string;
    timestamp: string;
  };

  const byActionId: Record<string, any> = Object.fromEntries(
    actions.map((a: any) => [a.id, a])
  );

  const timeline: TimelineRow[] = [
    // announcements
    ...actions.map((a: any) => ({
      id: `ann-${a.id}`,
      type: "announcement" as const,
      company: a.company,
      token: a.token,
      description:
        a.type === "dividend"
          ? `Dividend announced • ${a.company} (${a.token}) • ${a.payoutPerShare ?? 0} XRP/share`
          : `Stock split announced • ${a.company} (${a.token})`,
      timestamp: a.createdAt ?? new Date().toISOString(),
    })),

    // snapshots
    ...snapshots.map((s: any) => {
      const a = byActionId[s.actionId];
      return {
        id: s.id,
        type: "snapshot" as const,
        company: a?.company,
        token: a?.token,
        description: `Snapshot taken • ${a?.company ?? s.actionId} (${a?.token ?? ""}) • ${s.totalHolders} holders`,
        timestamp: s.takenAt,
      };
    }),

    // payouts (one per payment)
    ...payouts.map((p: any) => {
      const a = byActionId[p.actionId];
      return {
        id: p.id,
        type: "payout" as const,
        company: a?.company,
        token: a?.token,
        description: `Payout ${p.status} • ${p.amountXrp} XRP to ${p.address.slice(0, 6)}… • ${a?.company ?? p.actionId}`,
        timestamp: p.createdAt,
      };
    }),
  ].sort((l, r) => (l.timestamp < r.timestamp ? 1 : -1));

  return NextResponse.json({
    kpis: {
      announcementsPosted,
      snapshotsTaken,
      payoutsCompleted,
      totalXrpDistributed,
    },
    timeline,
  });
}

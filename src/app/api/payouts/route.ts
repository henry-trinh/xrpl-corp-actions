export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listAllPayouts, listPayoutsForAction } from "@/lib/dev-store";

/**
 * GET /api/payouts
 * GET /api/payouts?actionId=<id>
 * Returns flat list of payout rows.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const actionId = url.searchParams.get("actionId") ?? undefined;

  const rows = actionId ? listPayoutsForAction(actionId) : listAllPayouts();

  // Sort newest first
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json(rows);
}

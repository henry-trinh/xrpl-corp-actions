export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listSnapshots } from "@/lib/dev-store";

/**
 * GET /api/snapshots
 * GET /api/snapshots?actionId=<id>
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const actionId = url.searchParams.get("actionId") ?? undefined;

  const all = listSnapshots();
  const rows = actionId ? all.filter(s => s.actionId === actionId) : all;

  // newest first
  rows.sort((a, b) => (a.takenAt < b.takenAt ? 1 : -1));

  return NextResponse.json(rows);
}

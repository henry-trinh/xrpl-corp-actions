// src/app/api/dev/store/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listActions, listSnapshots, listAllPayouts } from "@/lib/dev-store";

export async function GET() {
  return NextResponse.json({
    actions: listActions(),
    snapshots: listSnapshots(),
    payouts: listAllPayouts(),
  });
}

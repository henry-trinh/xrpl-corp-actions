// src/app/api/actions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
// import { mockActions } from "@/lib/mock-data"; // <-- remove
import { listActions, createAction } from "@/lib/dev-store"; // <-- add
import { sendAnnouncementMemo } from "@/lib/xrpl";

export async function GET() {
  // TODO: Replace with Firebase Firestore query later
  return NextResponse.json(listActions()); // <-- use store, not mocks
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const memoJson = {
      event: body.type,
      token: body.token,
      recordAt: body.recordAt,
      payableAt: body.payableAt,
      payoutPerShare: body.payoutPerShare ?? null,
    };

    const xrplAnnounceTx = await sendAnnouncementMemo(memoJson);

    const newAction = {
      id: `action-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: "announced",
      memoHex: Buffer.from(JSON.stringify(body.memoJson ?? {})).toString("hex"),
      xrplAnnounceTx,
    };

    createAction(newAction); // <-- IMPORTANT: persist in dev store

    return NextResponse.json(newAction, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to create action" }, { status: 502 });
  }
}

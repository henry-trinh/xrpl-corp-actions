// src/app/api/xrpl/announce-test/route.ts
// For testing: `curl -X POST http://localhost:3000/api/xrpl/announce-test`

export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { sendAnnouncementMemo } from "@/lib/xrpl";

export async function POST() {
  try {
    const hash = await sendAnnouncementMemo({
      event: "test",
      token: "DIS.Share",
      recordAt: new Date().toISOString(),
      payableAt: new Date().toISOString(),
      payoutPerShare: 0,
    });
    return NextResponse.json({ ok: true, hash });
  } catch (e: any) {
    // surface the actual engine code/message from our helper
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}

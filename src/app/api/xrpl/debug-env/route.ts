// src/app/api/xrpl/debug-env/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const seedSet = !!process.env.XRPL_PLATFORM_SEED;
  const dest = process.env.XRPL_ANNOUNCE_DEST ?? null;
  const url  = process.env.XRPL_RPC_URL ?? null;
  return NextResponse.json({
    seedSet,
    announceDest: dest,
    rpcUrl: url,
  });
}

// src/app/api/xrpl/ping/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Client } from "xrpl";

export async function GET() {
  const url = process.env.XRPL_RPC_URL ?? "wss://s.altnet.rippletest.net:51233";
  const c = new Client(url);
  await c.connect();
  const info = await c.request({ command: "server_info", api_version: 2 });
  await c.disconnect();
  return NextResponse.json({ ok: true, network_id: info.result.info.network_id });
}

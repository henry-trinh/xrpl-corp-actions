// src/app/api/xrpl/account-info/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Client } from "xrpl";

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  const c = new Client(process.env.XRPL_RPC_URL!);
  await c.connect();
  try {
    const info = await c.request({ command: "account_info", account: address, ledger_index: "validated" });
    return NextResponse.json({
      address,
      exists: true,
      balanceXRP: Number(info.result.account_data.Balance) / 1_000_000,
    });
  } catch (e: any) {
    // If account doesn't exist yet, account_info throws
    return NextResponse.json({ address, exists: false }, { status: 200 });
  } finally {
    await c.disconnect();
  }
}

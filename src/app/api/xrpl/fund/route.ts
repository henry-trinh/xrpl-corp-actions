// src/app/api/xrpl/fund/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";

const FAUCET = process.env.XRPL_FAUCET_URL ?? "https://faucet.altnet.rippletest.net/accounts";

export async function POST(request: Request) {
  const { address } = (await safeJson(request)) ?? {};

  // Try to fund a specific address if provided
  if (address) {
    // Attempt both common shapes
    const tries = [
      fetch(FAUCET, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ destination: address }) }),
      fetch(FAUCET, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ address }) }),
    ];
    for (const p of tries) {
      const res = await p;
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({ ok: true, fundedAddress: address, raw: json });
      }
    }
    return NextResponse.json({ ok: false, error: "Faucet did not accept destination/address body for top-up." }, { status: 400 });
  }

  // Otherwise: create a brand-new funded account
  const res = await fetch(FAUCET, { method: "POST" });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });

  const json = await res.json();
  const acct = json?.account ?? {};
  const classic = acct.classicAddress ?? acct.address;
  const secret = acct.secret ?? json?.seed;
  if (!classic || !secret) return NextResponse.json({ error: "Malformed faucet response", raw: json }, { status: 500 });

  return NextResponse.json({
    address: classic,
    seed: secret,          // copy to XRPL_PLATFORM_SEED for your platform account (testnet only)
    xAddress: acct.xAddress,
    amount: json?.amount,
    transactionHash: json?.transactionHash,
  });
}

async function safeJson(req: Request) {
  try { return await req.json(); } catch { return null; }
}

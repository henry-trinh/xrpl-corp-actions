// src/app/api/xrpl/announce-raw/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { Client, Wallet, convertStringToHex, Payment } from "xrpl";

export async function POST() {
  const url  = process.env.XRPL_RPC_URL!;
  const seed = process.env.XRPL_PLATFORM_SEED!;
  const dest = process.env.XRPL_ANNOUNCE_DEST!;

  const c = new Client(url);
  await c.connect();
  try {
    const w = Wallet.fromSeed(seed);

    const tx: Payment = {
      TransactionType: "Payment",
      Account: w.address,
      Destination: dest,
      Amount: "1", // 1 drop
      Memos: [{
        Memo: {
          MemoType: convertStringToHex("application/json"),
          MemoFormat: convertStringToHex("text/plain"),
          MemoData: convertStringToHex(JSON.stringify({
            event: "test",
            token: "DIS.Share",
            t: Date.now()
          })),
        }
      }]
    };

    const prepared = await c.autofill(tx);
    const signed   = w.sign(prepared);
    const res      = await c.submitAndWait(signed.tx_blob);

    return NextResponse.json({
      ok: true,
      engine_result: (res as any).result?.engine_result,
      engine_result_message: (res as any).result?.engine_result_message,
      hash: (res as any).result?.hash,
      full: res, // raw response for inspection
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  } finally {
    try { await c.disconnect(); } catch {}
  }
}

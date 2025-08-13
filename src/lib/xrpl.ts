// src/lib/xrpl.ts
import { Client, Wallet, convertStringToHex, xrpToDrops } from "xrpl";

const NET = process.env.XRPL_RPC_URL ?? "wss://s.altnet.rippletest.net:51233";
const SEED = process.env.XRPL_PLATFORM_SEED;
const ANNOUNCE_DEST = process.env.XRPL_ANNOUNCE_DEST;

async function withClient<T>(fn: (c: Client) => Promise<T>) {
  const c = new Client(NET);
  await c.connect();
  try { return await fn(c); }
  finally { try { await c.disconnect(); } catch { /* noop */ } }
}

export async function fundTestWallet() {
  return withClient(async (c) => {
    const { wallet, balance } = await c.fundWallet();
    return { address: wallet.address, seed: wallet.seed!, balance };
  });
}

export async function sendAnnouncementMemo(memoJson: Record<string, any>) {
    if (!SEED) throw new Error("XRPL_PLATFORM_SEED not set");
    if (!ANNOUNCE_DEST) throw new Error("XRPL_ANNOUNCE_DEST not set");
    return withClient(async (c) => {
      const wallet = Wallet.fromSeed(SEED);
  
      if (ANNOUNCE_DEST === wallet.address) {
        throw new Error("XRPL_ANNOUNCE_DEST must be a different address than the platform account");
      }
  
      const tx = {
        TransactionType: "Payment",
        Account: wallet.address,
        Destination: ANNOUNCE_DEST,   // <- no sink fallback
        Amount: "1",                  // 1 drop; bump to "10" if you prefer
        Memos: [{
          Memo: {
            MemoType: convertStringToHex("application/json"),
            MemoFormat: convertStringToHex("text/plain"),
            MemoData: convertStringToHex(JSON.stringify(memoJson)),
          }
        }]
      };
  
      const prepared = await c.autofill(tx as any);
      const signed   = wallet.sign(prepared);
      const res      = await c.submitAndWait(signed.tx_blob as string);
  
      // Normalize result across node versions
      const r    = (res as any).result ?? {};
      const code = r.engine_result ?? r.meta?.TransactionResult ?? r.error ?? "unknown";
      const msg  = r.engine_result_message ?? r.error_message ?? "";
      const hash = (r.hash as string) ?? (r.tx_json?.hash as string) ?? undefined;
  
      if (code !== "tesSUCCESS") {
        throw new Error(`XRPL submit failed: ${code}${msg ? " - " + msg : ""}`);
      }
      if (!hash) {
        // Very rare, but keep something useful
        return JSON.stringify({ ledger_index: r.ledger_index, ctid: r.ctid });
      }
      return hash;
    });
}
  
  

export async function payDividend(destination: string, xrpAmount: number, memoJson: Record<string, any>) {
  if (!SEED) throw new Error("XRPL_PLATFORM_SEED not set");
  return withClient(async (c) => {
    const wallet = Wallet.fromSeed(SEED);
    const drops = xrpToDrops(xrpAmount.toString());
    const tx = {
      TransactionType: "Payment",
      Account: wallet.address,
      Destination: destination,
      Amount: drops,
      Memos: [{
        Memo: {
          MemoType: convertStringToHex("application/json"),
          MemoFormat: convertStringToHex("text/plain"),
          MemoData: convertStringToHex(JSON.stringify(memoJson)),
        }
      }]
    };
    const prepared = await c.autofill(tx as any);
    const signed = wallet.sign(prepared);
    const res = await c.submitAndWait(signed.tx_blob);
    return res.result?.hash as string;
  });
}

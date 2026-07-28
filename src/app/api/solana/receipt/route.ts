import bs58 from "bs58";
import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { z } from "zod";

const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export async function GET(request: Request) {
  try {
    const signature = z.string().min(80).max(100).parse(new URL(request.url).searchParams.get("signature"));
    const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const transaction = await connection.getParsedTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (!transaction) return NextResponse.json({ verified: false, error: "Transaction not found on devnet." }, { status: 404 });
    const instruction = transaction.transaction.message.instructions.find((item) => item.programId.equals(memoProgram));
    if (!instruction) return NextResponse.json({ verified: false, error: "MirrorQA Memo instruction not found." }, { status: 422 });
    const memoText = "parsed" in instruction ? (typeof instruction.parsed === "string" ? instruction.parsed : JSON.stringify(instruction.parsed)) : ("data" in instruction ? Buffer.from(bs58.decode(instruction.data)).toString("utf8") : "");
    const memo = JSON.parse(memoText);
    const verified = transaction.meta?.err === null && memo.app === "MirrorQA" && memo.network === "devnet";
    return NextResponse.json({ verified, network: "devnet", signature, slot: transaction.slot, memo, explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet` }, { status: verified ? 200 : 422 });
  } catch (error) {
    return NextResponse.json({ verified: false, error: error instanceof Error ? error.message : "Receipt lookup failed." }, { status: 400 });
  }
}

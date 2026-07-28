import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyWalletProof } from "@/lib/solana/verify-wallet";

const schema = z.object({ publicKey: z.string(), message: z.string(), signature: z.string() });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const verified = verifyWalletProof(input);
    return NextResponse.json({ verified, network: "devnet", publicKey: input.publicKey }, { status: verified ? 200 : 401 });
  } catch (error) {
    return NextResponse.json({ verified: false, error: error instanceof Error ? error.message : "Verification failed." }, { status: 400 });
  }
}

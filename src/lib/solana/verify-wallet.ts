import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

export function verifyWalletProof(input: { publicKey: string; message: string; signature: string }) {
  if (!input.message.startsWith("MirrorQA wallet verification\nNetwork: Solana devnet")) return false;
  const wallet = input.message.match(/^Wallet: (.+)$/m)?.[1];
  const expires = input.message.match(/^Expires: (.+)$/m)?.[1];
  if (wallet !== input.publicKey || !expires) return false;
  const expiry = Date.parse(expires);
  if (!Number.isFinite(expiry) || expiry < Date.now() || expiry > Date.now() + 10 * 60_000) return false;
  return nacl.sign.detached.verify(new TextEncoder().encode(input.message), bs58.decode(input.signature), new PublicKey(input.publicKey).toBytes());
}

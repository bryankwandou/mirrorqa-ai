import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

export function verifyWalletProof(input: { publicKey: string; message: string; signature: string }) {
  if (!input.message.startsWith("MirrorQA wallet verification\nNetwork: Solana devnet")) return false;
  const expires = input.message.match(/^Expires: (.+)$/m)?.[1];
  if (!expires || Date.parse(expires) < Date.now()) return false;
  return nacl.sign.detached.verify(new TextEncoder().encode(input.message), bs58.decode(input.signature), new PublicKey(input.publicKey).toBytes());
}

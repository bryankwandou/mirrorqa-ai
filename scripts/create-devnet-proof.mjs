import bs58 from "bs58";
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";

const secret = process.env.SOLANA_PROOF_SECRET;
if (!secret) throw new Error("SOLANA_PROOF_SECRET is required.");
const bytes = /^[0-9a-f]{128}$/i.test(secret) ? Buffer.from(secret, "hex") : bs58.decode(secret);
const signer = Keypair.fromSecretKey(bytes);
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const memo = JSON.stringify({ app: "MirrorQA", network: "devnet", proof: "production-mvp-verified", build: "browser-agent-v2", ts: new Date().toISOString() });
const transaction = new Transaction().add(new TransactionInstruction({ keys: [], programId: memoProgram, data: Buffer.from(memo) }));
const signature = await sendAndConfirmTransaction(connection, transaction, [signer], { commitment: "confirmed" });
console.log(JSON.stringify({ signature, signer: signer.publicKey.toBase58(), explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet` }));

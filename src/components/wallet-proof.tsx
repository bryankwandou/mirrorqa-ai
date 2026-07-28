"use client";

import bs58 from "bs58";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, ExternalLink, LoaderCircle, Search, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";

type WalletProvider = { publicKey?: PublicKey; connect: () => Promise<{ publicKey: PublicKey }>; signMessage?: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>; signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }> };
type Receipt = { verified: boolean; signature: string; slot: number; explorerUrl: string; memo: { proof?: string; run?: string; ts?: string }; error?: string };
declare global { interface Window { solana?: WalletProvider; phantom?: { solana?: WalletProvider }; solflare?: WalletProvider } }

export function WalletProof() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Connect Phantom or Solflare to create a public devnet proof.");
  const [signature, setSignature] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const [busy, setBusy] = useState<"connect" | "verify" | "attest" | "lookup" | "">("");
  const provider = () => window.phantom?.solana || window.solana || window.solflare;

  async function connect() {
    const wallet = provider();
    if (!wallet) { setStatus("No compatible wallet found. Install Phantom or Solflare, then reload."); return; }
    setBusy("connect");
    try { const result = await wallet.connect(); setAddress(result.publicKey.toBase58()); setOwnershipVerified(false); setStatus("Wallet connected. Sign the challenge to prove ownership."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Connection rejected."); }
    finally { setBusy(""); }
  }

  async function signIdentity() {
    const wallet = provider();
    if (!wallet?.publicKey || !wallet.signMessage) { setStatus("This wallet does not expose message signing."); return; }
    setBusy("verify");
    try {
      const expires = new Date(Date.now() + 5 * 60_000).toISOString();
      const message = `MirrorQA wallet verification\nNetwork: Solana devnet\nWallet: ${wallet.publicKey.toBase58()}\nExpires: ${expires}`;
      const signed = await wallet.signMessage(new TextEncoder().encode(message), "utf8");
      const response = await fetch("/api/solana/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicKey: wallet.publicKey.toBase58(), message, signature: bs58.encode(signed.signature) }) });
      const data = await response.json();
      setOwnershipVerified(Boolean(data.verified));
      setStatus(data.verified ? "Cryptographic ownership verified by the server." : data.error || "Signature verification failed.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Signing rejected."); }
    finally { setBusy(""); }
  }

  async function lookupReceipt(value = signature) {
    const candidate = value.trim();
    if (!candidate) { setStatus("Paste a Solana devnet transaction signature first."); return; }
    setBusy("lookup");
    try {
      const response = await fetch(`/api/solana/receipt?signature=${encodeURIComponent(candidate)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.verified) throw new Error(data.error || "Receipt verification failed.");
      setSignature(candidate); setReceipt(data); setStatus("Memo confirmed and independently verified on Solana devnet.");
    } catch (error) { setReceipt(null); setStatus(error instanceof Error ? error.message : "Receipt lookup failed."); }
    finally { setBusy(""); }
  }

  async function attest() {
    const wallet = provider();
    if (!wallet?.publicKey || !ownershipVerified) { setStatus("Verify wallet ownership before writing an on-chain proof."); return; }
    setBusy("attest");
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
      const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      const memo = JSON.stringify({ app: "MirrorQA", network: "devnet", proof: "workflow-reviewed", run: "demo", ts: new Date().toISOString() });
      const transaction = new Transaction().add(new TransactionInstruction({ keys: [], programId: memoProgram, data: Buffer.from(memo) }));
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
      const sent = await wallet.signAndSendTransaction(transaction);
      const confirmation = await connection.confirmTransaction(sent.signature, "confirmed");
      if (confirmation.value.err) throw new Error("The devnet transaction was rejected.");
      setSignature(sent.signature);
      await lookupReceipt(sent.signature);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Devnet transaction failed."); }
    finally { setBusy(""); }
  }

  const publicProof = process.env.NEXT_PUBLIC_SOLANA_PROOF_SIGNATURE || "";
  return <motion.section className="wallet-card" layout><div className="wallet-head"><span><Wallet size={20} /></span><div><b>Solana proof</b><small>Wallet-owned, public, and independently verifiable</small></div><i>Devnet</i></div><div className="proof-steps"><span className={address ? "done" : "active"}>{address ? <Check size={12} /> : "1"} Connect</span><i /><span className={ownershipVerified ? "done" : address ? "active" : ""}>{ownershipVerified ? <Check size={12} /> : "2"} Verify</span><i /><span className={receipt?.verified ? "done" : ownershipVerified ? "active" : ""}>{receipt?.verified ? <Check size={12} /> : "3"} Attest</span></div><div className="wallet-address">{address ? `${address.slice(0, 7)}...${address.slice(-7)}` : "No wallet connected"}</div><p className="wallet-status" aria-live="polite"><CheckCircle2 size={16} />{status}</p><div className="wallet-actions"><button className="button dark" onClick={connect} disabled={Boolean(busy)}>{busy === "connect" ? <LoaderCircle className="spin" size={15} /> : <Wallet size={15} />} Connect wallet</button><button className="button ghost" onClick={signIdentity} disabled={!address || Boolean(busy)}>{busy === "verify" ? <LoaderCircle className="spin" size={15} /> : <ShieldCheck size={15} />} Verify ownership</button><button className="button primary" onClick={attest} disabled={!ownershipVerified || Boolean(busy)}>{busy === "attest" ? <LoaderCircle className="spin" size={15} /> : null}Write devnet proof</button></div><div className="receipt-lookup"><span>Verify any MirrorQA receipt</span><div><input aria-label="Devnet transaction signature" value={signature} onChange={(event) => setSignature(event.target.value)} placeholder="Paste devnet signature" /><button onClick={() => lookupReceipt()} disabled={Boolean(busy)} aria-label="Verify receipt">{busy === "lookup" ? <LoaderCircle className="spin" size={15} /> : <Search size={15} />}</button></div>{publicProof && <button className="proof-sample" onClick={() => { setSignature(publicProof); void lookupReceipt(publicProof); }} disabled={Boolean(busy)}>Verify launch proof</button>}</div><AnimatePresence>{receipt?.verified && <motion.div className="verified-receipt" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}><b><ShieldCheck size={15} /> Verified on devnet</b><small>Slot {receipt.slot.toLocaleString()} · {receipt.memo.proof || "MirrorQA proof"}</small><a href={receipt.explorerUrl} target="_blank" rel="noreferrer">Open Solana Explorer <ExternalLink size={13} /></a></motion.div>}</AnimatePresence></motion.section>;
}

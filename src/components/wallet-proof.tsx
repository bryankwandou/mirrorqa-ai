"use client";

import bs58 from "bs58";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { CheckCircle2, ExternalLink, LoaderCircle, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";

type WalletProvider = { publicKey?: PublicKey; connect: () => Promise<{ publicKey: PublicKey }>; signMessage?: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>; signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }> };
declare global { interface Window { solana?: WalletProvider; phantom?: { solana?: WalletProvider }; solflare?: WalletProvider } }

export function WalletProof() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Connect Phantom or Solflare to create a public devnet proof.");
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const provider = () => window.phantom?.solana || window.solana || window.solflare;

  async function connect() {
    const wallet = provider();
    if (!wallet) { setStatus("No compatible wallet found. Install Phantom or Solflare, then reload."); return; }
    setBusy(true);
    try { const result = await wallet.connect(); setAddress(result.publicKey.toBase58()); setStatus("Wallet connected on Solana devnet."); } catch (error) { setStatus(error instanceof Error ? error.message : "Connection rejected."); } finally { setBusy(false); }
  }

  async function signIdentity() {
    const wallet = provider();
    if (!wallet?.publicKey || !wallet.signMessage) { setStatus("This wallet does not expose message signing."); return; }
    setBusy(true);
    try {
      const expires = new Date(Date.now() + 5 * 60_000).toISOString();
      const message = `MirrorQA wallet verification\nNetwork: Solana devnet\nWallet: ${wallet.publicKey.toBase58()}\nExpires: ${expires}`;
      const signed = await wallet.signMessage(new TextEncoder().encode(message), "utf8");
      const response = await fetch("/api/solana/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicKey: wallet.publicKey.toBase58(), message, signature: bs58.encode(signed.signature) }) });
      const data = await response.json();
      setStatus(data.verified ? "Cryptographic ownership verified by the server." : data.error || "Signature verification failed.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Signing rejected."); } finally { setBusy(false); }
  }

  async function attest() {
    const wallet = provider();
    if (!wallet?.publicKey) { setStatus("Connect a wallet first."); return; }
    setBusy(true);
    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
      const memo = JSON.stringify({ app: "MirrorQA", network: "devnet", proof: "workflow-reviewed", run: "demo", ts: new Date().toISOString() });
      const transaction = new Transaction().add(new TransactionInstruction({ keys: [], programId: memoProgram, data: Buffer.from(memo) }));
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
      const sent = await wallet.signAndSendTransaction(transaction);
      await connection.confirmTransaction(sent.signature, "confirmed");
      const response = await fetch(`/api/solana/receipt?signature=${sent.signature}`);
      const receipt = await response.json();
      setSignature(sent.signature);
      setStatus(receipt.verified ? "Memo confirmed and independently verified on Solana devnet." : receipt.error || "Transaction landed but receipt verification failed.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Devnet transaction failed."); } finally { setBusy(false); }
  }

  return <section className="wallet-card"><div className="wallet-head"><span><Wallet size={20} /></span><div><b>Solana proof</b><small>Wallet-owned, public, and independently verifiable</small></div><i>Devnet</i></div><div className="wallet-address">{address ? `${address.slice(0, 7)}…${address.slice(-7)}` : "No wallet connected"}</div><p className="wallet-status"><CheckCircle2 size={16} />{status}</p><div className="wallet-actions"><button className="button dark" onClick={connect} disabled={busy}>{busy ? <LoaderCircle className="spin" size={15} /> : <Wallet size={15} />} Connect wallet</button><button className="button ghost" onClick={signIdentity} disabled={!address || busy}><ShieldCheck size={15} /> Verify ownership</button><button className="button primary" onClick={attest} disabled={!address || busy}>Write devnet proof</button></div>{signature && <a className="explorer-link" href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noreferrer">Open verified transaction <ExternalLink size={14} /></a>}</section>;
}

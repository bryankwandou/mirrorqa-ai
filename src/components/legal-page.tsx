import Link from "next/link";
import { Brand } from "./brand";
export function LegalPage({title,updated,children}:{title:string;updated:string;children:React.ReactNode}){return <main className="legal-page"><nav><Brand/><Link href="/">Back to home</Link></nav><article><span className="eyebrow">Legal / Last updated {updated}</span><h1>{title}</h1><p className="legal-lead">Plain-language terms for the MirrorQA MVP. Formal commercial use requires independent legal review.</p>{children}</article></main>}

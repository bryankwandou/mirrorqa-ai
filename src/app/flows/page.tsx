import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { flows, personas } from "@/lib/data";

export default function FlowsPage() {
  return <AppShell active="flows"><div className="page-content"><div className="page-title"><div><span className="eyebrow">Customer journeys</span><h1>Flows</h1><p>Register the paths your customers cannot afford to lose.</p></div><Link className="button dark" href="/flows/new"><Plus size={16} /> New flow</Link></div><div className="filter-bar"><label><Search size={16} /><input placeholder="Search flows" /></label><button className="button ghost">All statuses</button><span>{flows.length} active flows</span></div><div className="flow-card-grid">{flows.map((flow, index) => <Link href={`/flows/${flow.id}`} className="flow-card" key={flow.id}><div className="flow-card-head"><i className={`flow-glyph glyph-${index}`} /><span><i className={`status-dot s-${index}`} />{flow.status}</span></div><h2>{flow.name}</h2><p>{flow.url}</p><div className="persona-stack">{personas.slice(0, index + 3).map((persona) => <i key={persona.key}>{persona.mark}</i>)}</div><div className="flow-card-foot"><span><b>{flow.score}</b> experience score</span><span>{flow.runs} runs <ArrowRight size={14} /></span></div></Link>)}</div></div></AppShell>;
}

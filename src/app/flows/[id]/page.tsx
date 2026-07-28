import Link from "next/link";
import { ArrowRight, CalendarClock, Play } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { personas } from "@/lib/data";

export default function FlowDetailPage() {
  return <AppShell active="flows"><div className="page-content"><div className="page-title"><div><span className="eyebrow">Customer flow</span><h1>Trial to checkout</h1><p>northstar.app/pricing → reach the workspace without making a real payment</p></div><Link className="button primary" href="/runs/demo"><Play size={15} /> Start five-persona run</Link></div><div className="metric-grid"><article><span>Experience score</span><strong>71<small>/100</small></strong><p>Needs review</p></article><article><span>Total runs</span><strong>28</strong><p>Last run 2 hours ago</p></article><article><span>Open findings</span><strong>5</strong><p>1 high severity</p></article><article><span>Schedule</span><strong className="metric-word">Weekly</strong><p><CalendarClock size={14} /> Mondays at 09:00</p></article></div><section className="panel"><div className="panel-head"><div><h2>Customer coverage</h2><p>Five distinct decision policies</p></div></div><div className="coverage-list">{personas.map((persona,index)=><div key={persona.key}><span className={`persona-number ${persona.color}`}>{persona.mark}</span><span><b>{persona.name}</b><small>{persona.note}</small></span><strong>{[78,71,83,86,62][index]}<small>/100</small></strong><Link href="/runs/demo">Latest run <ArrowRight size={13} /></Link></div>)}</div></section></div></AppShell>;
}

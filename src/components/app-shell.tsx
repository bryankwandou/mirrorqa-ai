import Link from "next/link";
import { Activity, Bell, ChevronDown, CircleHelp, LayoutDashboard, Route, Settings2 } from "lucide-react";
import { Brand } from "./brand";

export function AppShell({ children, active = "dashboard" }: { children: React.ReactNode; active?: string }) {
  const nav = [
    { href: "/dashboard", label: "Overview", key: "dashboard", icon: LayoutDashboard },
    { href: "/flows", label: "Flows", key: "flows", icon: Route },
    { href: "/runs/demo", label: "Live runs", key: "runs", icon: Activity }
  ];
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Brand />
        <div className="workspace"><span className="avatar small">N</span><span><b>Northstar</b><small>Product team</small></span><ChevronDown size={15} /></div>
        <nav className="side-nav">
          <small>Workspace</small>
          {nav.map(({ href, label, key, icon: Icon }) => <Link className={active === key ? "active" : ""} href={href} key={key}><Icon size={17} />{label}</Link>)}
          <small>Manage</small>
          <Link href="/proof"><Settings2 size={17} />Proof lab</Link>
        </nav>
        <div className="sidebar-foot"><Link href="/docs"><CircleHelp size={17} />Documentation</Link><div className="profile"><span className="avatar">AK</span><span><b>Alex Kim</b><small>alex@northstar.co</small></span></div></div>
      </aside>
      <main className="app-main">
        <header className="topbar"><span className="crumb">Northstar / <b>{active === "dashboard" ? "Overview" : active === "runs" ? "Run detail" : "Flows"}</b></span><div><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><span className="network"><i /> Solana devnet</span></div></header>
        {children}
      </main>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { NewFlowForm } from "@/components/new-flow-form";

export default function NewFlowPage() {
  return <AppShell active="flows"><div className="form-page"><Link className="back-link" href="/flows"><ArrowLeft size={15} /> Back to flows</Link><div className="page-title"><div><span className="eyebrow">New customer journey</span><h1>What should customers accomplish?</h1><p>Define one concrete outcome, then watch a real model-directed browser attempt it.</p></div></div><NewFlowForm /></div></AppShell>;
}

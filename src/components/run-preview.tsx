import { Check, CreditCard, MousePointer2, ShieldAlert } from "lucide-react";
import { steps } from "@/lib/data";

export function RunPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`run-window ${compact ? "compact" : ""}`}>
      <div className="browser-bar"><span className="lights"><i /><i /><i /></span><span className="address">northstar.app/pricing</span><span className="live-dot">Live</span></div>
      <div className="run-inner">
        <div className="run-heading"><div><span className="eyebrow">Persona 02</span><h3>Price-sensitive visitor</h3></div><span className="running"><i /> Running</span></div>
        <div className="step-list">
          {steps.map((step, index) => (
            <div className={`mini-step ${step.status}`} key={step.id}>
              <div className="step-icon">{step.status === "blocked" ? <ShieldAlert size={16} /> : step.status === "friction" ? <CreditCard size={16} /> : index === 2 ? <MousePointer2 size={16} /> : <Check size={16} />}</div>
              <div><div className="step-meta"><span>{step.time}</span><b>{step.title}</b></div><p>“{step.reason}”</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

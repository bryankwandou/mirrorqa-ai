import { personas } from "@/lib/data";

export function PersonaGrid() {
  return <div className="persona-grid">{personas.map((persona) => <article className="persona-card" key={persona.key}><span className={`persona-number ${persona.color}`}>{persona.mark}</span><h3>{persona.name}</h3><p>{persona.note}</p><span className="text-link">Behavior profile <b>→</b></span></article>)}</div>;
}

"use client";

import { useState } from "react";

export default function CheckoutFixturePage() {
  const [stage, setStage] = useState<"pricing" | "account" | "payment">("pricing");
  if (stage === "pricing") return <main className="fixture"><nav><b>Northstar</b><span>Product Pricing Docs</span></nav><section><small>14-day trial</small><h1>Simple pricing for growing teams</h1><p>Starter includes 10 projects and team collaboration for $19 each month.</p><article><h2>Starter</h2><strong>$19 <small>/ month</small></strong><ul><li>10 active projects</li><li>5 team members</li><li>Email support</li></ul><button onClick={() => setStage("account")}>Start free</button></article><button className="link-button">Compare plans</button></section></main>;
  if (stage === "account") return <main className="fixture"><nav><b>Northstar</b><span>Step 1 of 2</span></nav><section><small>Create workspace</small><h1>Where should we send your test access?</h1><label>Work email<input aria-label="Work email" placeholder="test@example.com" /></label><button onClick={() => setStage("payment")}>Continue</button></section></main>;
  return <main className="fixture"><nav><b>Northstar</b><span>Step 2 of 2</span></nav><section><small>Final step</small><h1>Confirm your subscription</h1><p>Your trial starts today. A payment method is required before continuing.</p><label>Card number<input aria-label="Card number" placeholder="4242 4242 4242 4242" /></label><button>Confirm subscription</button></section></main>;
}

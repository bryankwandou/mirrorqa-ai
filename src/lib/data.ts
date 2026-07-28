export const personas = [
  { key: "impatient", name: "Impatient", mark: "01", color: "coral", note: "Scans for the shortest visible route and leaves when progress stalls." },
  { key: "price", name: "Price-sensitive", mark: "02", color: "amber", note: "Looks for total cost before making any commitment." },
  { key: "low-tech", name: "Low-tech literacy", mark: "03", color: "blue", note: "Needs plain labels, visible progress, and reversible choices." },
  { key: "language", name: "Non-native English", mark: "04", color: "violet", note: "Tests idioms, dense instructions, and ambiguous wording." },
  { key: "accessibility", name: "Screen-reader dependent", mark: "05", color: "green", note: "Navigates through semantics, labels, focus order, and alternatives." }
] as const;

export const steps = [
  { id: 1, time: "00:02", title: "Opened the pricing page", action: "navigate /pricing", reason: "I need to know what this costs before I give away my email.", status: "passed" },
  { id: 2, time: "00:07", title: "Compared plan details", action: "read pricing cards", reason: "The monthly number is clear, but I cannot find whether usage overages exist.", status: "friction" },
  { id: 3, time: "00:14", title: "Started the trial", action: "click Start free", reason: "Free is explicit and the button tells me what happens next.", status: "passed" },
  { id: 4, time: "00:21", title: "Reached payment form", action: "click Confirm subscription", reason: "This appears to create a charge. I will not continue without explicit sandbox proof.", status: "blocked" }
] as const;

export const findings = [
  { severity: "high", title: "Usage overages are not explained near the price", detail: "The price-sensitive persona stopped to search for a cost ceiling before starting the trial.", step: 2 },
  { severity: "medium", title: "Trial path reaches payment language unexpectedly", detail: "The call to action says free, while the final control says Confirm subscription. The change in commitment is not prepared for.", step: 4 },
  { severity: "low", title: "Plan comparison requires repeated scanning", detail: "Limits use different units across cards, making direct comparison slower than necessary.", step: 2 }
] as const;

export const flows = [
  { id: "checkout", name: "Trial to checkout", url: "acme.test/pricing", runs: 28, score: 71, status: "Needs review" },
  { id: "onboarding", name: "New workspace onboarding", url: "acme.test/welcome", runs: 16, score: 88, status: "Healthy" },
  { id: "support", name: "Support escalation", url: "acme.test/help", runs: 9, score: 62, status: "Regressed" }
] as const;

const paymentSignals = [
  /pay\s*(now|today)?/i,
  /place\s*(order|purchase)/i,
  /confirm\s*(purchase|payment|subscription|order)/i,
  /complete\s*(purchase|payment|checkout)/i,
  /buy\s*(now)?/i,
  /submit\s*(payment|order)/i,
  /authori[sz]e\s*(charge|payment)/i
];

const piiSignals = [
  /social\s*security|ssn|national\s*id/i,
  /credit\s*card|card\s*number|cvv|cvc|expiry/i,
  /passport|driver'?s?\s*licen[cs]e/i,
  /bank\s*account|routing\s*number/i,
  /date\s*of\s*birth|birth\s*date/i
];

const safeTestValue = /^(test|demo|sandbox|example|qa)[+._\-@a-z0-9 ]*$/i;

export function validateActionAgainstSafetyGuardrail(action) {
  const target = [action.label, action.text, action.ariaLabel, action.name, action.placeholder, action.type].filter(Boolean).join(" ");
  const value = String(action.value ?? "").trim();

  if (action.kind === "click" && paymentSignals.some((signal) => signal.test(target))) {
    return { allowed: false, code: "PAYMENT_COMPLETION_BLOCKED", reason: "A payment or purchase completion control can never be activated." };
  }

  if (action.kind === "type" && piiSignals.some((signal) => signal.test(target)) && !safeTestValue.test(value)) {
    return { allowed: false, code: "PII_INPUT_BLOCKED", reason: "Sensitive identity or payment data must not be entered." };
  }

  return { allowed: true, code: "ALLOWED", reason: "No deterministic payment-completion or sensitive-data signal was found." };
}

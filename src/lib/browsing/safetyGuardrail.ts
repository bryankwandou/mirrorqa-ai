export type BrowserAction = {
  kind: "click" | "type" | "navigate" | "scroll" | "read";
  label?: string;
  text?: string;
  ariaLabel?: string;
  name?: string;
  placeholder?: string;
  type?: string;
  value?: string;
};

export type GuardrailResult = { allowed: boolean; code: "ALLOWED" | "PAYMENT_COMPLETION_BLOCKED" | "PII_INPUT_BLOCKED"; reason: string };

// @ts-expect-error The tested implementation is JavaScript for direct Node execution.
export { validateActionAgainstSafetyGuardrail } from "./safetyGuardrail.mjs";

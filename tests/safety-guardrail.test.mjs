import test from "node:test";
import assert from "node:assert/strict";
import { validateActionAgainstSafetyGuardrail } from "../src/lib/browsing/safetyGuardrail.mjs";

test("blocks obvious and disguised payment completion", () => {
  for (const label of ["Pay now", "Place order", "Confirm subscription", "Authorize charge", "Complete checkout"]) {
    assert.equal(validateActionAgainstSafetyGuardrail({ kind: "click", label }).allowed, false, label);
  }
});

test("blocks sensitive values in ambiguously described controls", () => {
  const cases = [
    { name: "government identifier SSN", value: "123-45-6789" },
    { ariaLabel: "security code CVV", value: "123" },
    { placeholder: "Card number", value: "4242424242424242" },
    { label: "Date of birth", value: "1990-01-01" }
  ];
  for (const item of cases) assert.equal(validateActionAgainstSafetyGuardrail({ kind: "type", ...item }).allowed, false);
});

test("allows safe test values and unrelated confirmation", () => {
  assert.equal(validateActionAgainstSafetyGuardrail({ kind: "type", label: "Card number", value: "test-card" }).allowed, true);
  assert.equal(validateActionAgainstSafetyGuardrail({ kind: "click", label: "Confirm workspace name" }).allowed, true);
  assert.equal(validateActionAgainstSafetyGuardrail({ kind: "click", label: "Continue" }).allowed, true);
});

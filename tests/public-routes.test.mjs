import test from "node:test";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL;

test("public production routes are reachable", { skip: !base }, async () => {
  for (const path of ["/", "/flows/new", "/runs/live", "/proof", "/api/health"]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
  }
});

import { chromium } from "playwright-core";

const base = process.env.TEST_BASE_URL || "https://mirrorqa-ai.vercel.app";
const executablePath = process.env.CHROME_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ executablePath, headless: true });
const queue = [new URL("/", base).href];
const visited = new Set();
const failures = [];
const consoleErrors = [];
const badRequests = [];

while (queue.length && visited.size < 100) {
  const url = queue.shift();
  if (!url || visited.has(url)) continue;
  visited.add(url);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push({ url, message: message.text() }); });
  page.on("response", (response) => { if (response.status() >= 400) badRequests.push({ page: url, resource: response.url(), status: response.status() }); });
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
    if (!response || response.status() >= 400) failures.push({ url, status: response?.status() || 0 });
    const links = await page.locator("a[href]").evaluateAll((items) => items.map((item) => item.href));
    for (const link of links) {
      const target = new URL(link);
      target.hash = "";
      if (target.origin === new URL(base).origin && !visited.has(target.href) && !target.pathname.startsWith("/api/")) queue.push(target.href);
    }
  } catch (error) {
    failures.push({ url, error: error instanceof Error ? error.message : String(error) });
  } finally { await page.close(); }
}

await browser.close();
console.log(JSON.stringify({ base, pages: [...visited], failures, consoleErrors, badRequests }, null, 2));
if (failures.length || consoleErrors.length || badRequests.length) process.exitCode = 1;

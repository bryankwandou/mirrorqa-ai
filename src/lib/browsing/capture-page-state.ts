import type { Page } from "playwright-core";

export async function capturePageState(page: Page) {
  return page.locator("body").evaluate((body) => {
    const elements = Array.from(body.querySelectorAll("button,a,input,textarea,select,[role='button']")).map((element) => {
      const node = element as HTMLElement;
      const input = element as HTMLInputElement;
      const rect = node.getBoundingClientRect();
      return { tag: node.tagName.toLowerCase(), label: node.textContent?.trim() || input.getAttribute("aria-label") || input.placeholder || input.name || "unlabeled", type: input.type || undefined, position: `${Math.round(rect.x)},${Math.round(rect.y)}` };
    });
    return { title: document.title, url: location.href, text: body.textContent?.slice(0, 3000) || "", elements };
  });
}

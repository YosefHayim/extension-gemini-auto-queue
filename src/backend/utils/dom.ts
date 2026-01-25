import { sleep } from "@/backend/utils/timing";

export function findElement(...selectors: string[]): Element | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) return element;
    } catch {
      // Invalid selector, skip
    }
  }
  return null;
}

export function findElements(...selectors: string[]): Element[] {
  const results: Element[] = [];
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      results.push(...Array.from(elements));
    } catch {
      // Invalid selector, skip
    }
  }
  return results;
}

export function findByText(selector: string, patterns: string[]): Element | null {
  const elements = document.querySelectorAll(selector);
  for (const el of elements) {
    const text = el.textContent?.toLowerCase() ?? "";
    if (patterns.some((p) => text.includes(p.toLowerCase()))) {
      return el;
    }
  }
  return null;
}

export function findByAriaLabel(patterns: string[]): Element | null {
  const buttons = document.querySelectorAll("button");
  for (const btn of buttons) {
    const ariaLabel = (btn.getAttribute("aria-label") ?? "").toLowerCase();
    if (patterns.some((p) => ariaLabel.includes(p.toLowerCase()))) {
      return btn;
    }
  }
  return null;
}

export async function clickElement(el: Element, delayMs = 300): Promise<void> {
  (el as HTMLElement).click();
  await sleep(delayMs);
}

export async function waitForElement(
  selector: string,
  timeout = 10000,
  pollInterval = 100
): Promise<Element | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await sleep(pollInterval);
  }

  return null;
}

export function base64ToFile(base64: string, filename: string): File {
  const parts = base64.split(",");
  const mimeMatch = /:(.*?);/.exec(parts[0]);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const data = parts.length > 1 ? parts[1] : parts[0];

  const byteString = atob(data);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new File([byteArray], filename, { type: mime });
}

export function getMimeFromBase64(base64: string): string {
  const mimeMatch = /data:(.*?);/.exec(base64);
  return mimeMatch ? mimeMatch[1] : "application/octet-stream";
}

export function getExtFromMime(mime: string): string {
  return mime.split("/")[1]?.split("+")[0] || "bin";
}

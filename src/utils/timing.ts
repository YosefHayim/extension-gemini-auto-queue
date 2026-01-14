export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delay(ms: number): Promise<void> {
  return sleep(ms);
}

export function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage?: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage ?? `Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function waitUntil(
  condition: () => boolean | Promise<boolean>,
  timeout = 30000,
  pollInterval = 100
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) return true;
    await sleep(pollInterval);
  }

  return false;
}

export * from "./errors.js";
export * from "./crypto.js";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function getClientIp(request: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}): string | null {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(",")[0].trim();
  }
  return request.ip ?? null;
}

export function sanitizeUserAgent(userAgent: string | undefined): string | null {
  if (!userAgent) return null;
  return userAgent.slice(0, 500);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function calculateExpirationDate(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

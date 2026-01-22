import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { OTP_CONFIG } from "../constants/index.js";

export function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  const bytes = randomBytes(OTP_CONFIG.LENGTH);

  for (let i = 0; i < OTP_CONFIG.LENGTH; i++) {
    otp += digits[bytes[i] % 10];
  }

  return otp;
}

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

export function hashWithHMAC(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function verifyHMAC(data: string, signature: string, secret: string): boolean {
  const expectedSignature = hashWithHMAC(data, secret);

  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"));
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const visibleChars = Math.min(3, Math.floor(localPart.length / 2));
  const maskedPart = "*".repeat(localPart.length - visibleChars);

  return `${localPart.slice(0, visibleChars)}${maskedPart}@${domain}`;
}

export function generateNonce(): string {
  return randomBytes(16).toString("base64url");
}

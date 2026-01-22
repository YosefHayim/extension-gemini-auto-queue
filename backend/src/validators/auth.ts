import { z } from "zod";
import { OTP_CONFIG } from "../constants/index.js";

export const emailSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const otpRequestSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const otpVerifySchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  code: z
    .string()
    .length(OTP_CONFIG.LENGTH, `Code must be ${OTP_CONFIG.LENGTH} digits`)
    .regex(/^\d+$/, "Code must contain only numbers"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type EmailInput = z.infer<typeof emailSchema>;
export type OTPRequestInput = z.infer<typeof otpRequestSchema>;
export type OTPVerifyInput = z.infer<typeof otpVerifySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

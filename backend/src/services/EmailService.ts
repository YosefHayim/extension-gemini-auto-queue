import { render } from "@react-email/components";
import { Resend } from "resend";

import { env } from "../config/env.js";
import { EMAIL_SUBJECTS } from "../constants/messages.js";
import {
  OTPEmail,
  WelcomeEmail,
  CreditsLowEmail,
  SubscriptionConfirmedEmail,
} from "../emails/index.js";

const resend = new Resend(env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(params: EmailParams): Promise<void> {
  await resend.emails.send({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const html = await render(OTPEmail({ otp }));
  const text = `Your PromptQueue verification code is: ${otp}. This code expires in 10 minutes.`;

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.OTP_VERIFICATION,
    html,
    text,
  });
}

export async function sendWelcomeEmail(email: string, name: string | null): Promise<void> {
  const html = await render(WelcomeEmail({ name }));

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.WELCOME,
    html,
  });
}

export async function sendCreditsLowEmail(email: string, creditsRemaining: number): Promise<void> {
  const html = await render(CreditsLowEmail({ creditsRemaining }));

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.CREDITS_LOW,
    html,
  });
}

export async function sendSubscriptionConfirmedEmail(
  email: string,
  planName: string
): Promise<void> {
  const html = await render(SubscriptionConfirmedEmail({ planName }));

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.SUBSCRIPTION_CONFIRMED,
    html,
  });
}

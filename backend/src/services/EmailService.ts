import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { env } from "../config/env.js";
import { EMAIL_SUBJECTS } from "../constants/messages.js";

const sesClient = new SESClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(params: EmailParams): Promise<void> {
  const command = new SendEmailCommand({
    Source: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    Destination: {
      ToAddresses: [params.to],
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: params.html,
          Charset: "UTF-8",
        },
        ...(params.text && {
          Text: {
            Data: params.text,
            Charset: "UTF-8",
          },
        }),
      },
    },
  });

  await sesClient.send(command);
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="margin: 0 0 24px; font-size: 24px; color: #1a1a1a;">Verify your email</h1>
        <p style="margin: 0 0 24px; font-size: 16px; color: #666; line-height: 1.5;">
          Enter this code to sign in to Gemini Nano Flow:
        </p>
        <div style="background: #f0f0f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${otp}</span>
        </div>
        <p style="margin: 0; font-size: 14px; color: #999; line-height: 1.5;">
          This code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.OTP_VERIFICATION,
    html,
    text: `Your Gemini Nano Flow verification code is: ${otp}. This code expires in 10 minutes.`,
  });
}

export async function sendWelcomeEmail(email: string, name: string | null): Promise<void> {
  const displayName = name ?? "there";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="margin: 0 0 24px; font-size: 24px; color: #1a1a1a;">Welcome to Gemini Nano Flow!</h1>
        <p style="margin: 0 0 16px; font-size: 16px; color: #666; line-height: 1.5;">
          Hi ${displayName},
        </p>
        <p style="margin: 0 0 24px; font-size: 16px; color: #666; line-height: 1.5;">
          You're all set! You have <strong>100 free credits</strong> to try out all features.
        </p>
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: white; line-height: 1.5;">
            <strong>What you can do:</strong><br>
            • Queue and batch process prompts<br>
            • Generate images and videos<br>
            • Use all Gemini tools automatically
          </p>
        </div>
        <p style="margin: 0; font-size: 14px; color: #999;">
          Need more? Upgrade to unlimited for just $2/month.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.WELCOME,
    html,
  });
}

export async function sendCreditsLowEmail(email: string, creditsRemaining: number): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="margin: 0 0 24px; font-size: 24px; color: #1a1a1a;">Running low on credits</h1>
        <p style="margin: 0 0 24px; font-size: 16px; color: #666; line-height: 1.5;">
          You have <strong>${creditsRemaining} credits</strong> remaining on your free plan.
        </p>
        <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
            Upgrade to get <strong>unlimited</strong> usage for just $2/month or $16/year.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

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
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="margin: 0 0 24px; font-size: 24px; color: #1a1a1a;">Subscription Active!</h1>
        <p style="margin: 0 0 24px; font-size: 16px; color: #666; line-height: 1.5;">
          Your <strong>${planName}</strong> subscription is now active. You have unlimited access to all features!
        </p>
        <div style="background: #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.5;">
            ✓ Unlimited queue processing<br>
            ✓ All Gemini tools<br>
            ✓ Priority support
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.SUBSCRIPTION_CONFIRMED,
    html,
  });
}

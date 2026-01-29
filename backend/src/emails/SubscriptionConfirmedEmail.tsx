import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SubscriptionConfirmedEmailProps {
  planName: string;
}

export function SubscriptionConfirmedEmail({ planName }: SubscriptionConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to PromptQueue {planName}! Your upgrade is complete.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>PromptQueue</Text>
          </Section>

          <Section style={celebrationSection}>
            <Text style={celebrationEmoji}>🎉</Text>
          </Section>

          <Heading style={heading}>You&apos;re now a Lifetime member!</Heading>

          <Text style={paragraph}>
            Thank you for your purchase. Your account has been upgraded and you now have access to
            all Lifetime benefits.
          </Text>

          <Section style={successBox}>
            <Text style={successTitle}>Your new limits</Text>
            <Text style={successNumber}>100</Text>
            <Text style={successLabel}>prompts per day</Text>
          </Section>

          <Section style={benefitsSection}>
            <Text style={benefitsTitle}>What you unlocked:</Text>
            <Text style={benefitItem}>
              <span style={checkmark}>✓</span> 10x more daily prompts (100 vs 10)
            </Text>
            <Text style={benefitItem}>
              <span style={checkmark}>✓</span> Priority email support
            </Text>
            <Text style={benefitItem}>
              <span style={checkmark}>✓</span> Access to all future updates
            </Text>
            <Text style={benefitItem}>
              <span style={checkmark}>✓</span> No recurring charges - ever
            </Text>
          </Section>

          <Hr style={divider} />

          <Text style={tipText}>
            <strong>Pro tip:</strong> Your daily limit resets at midnight UTC. Plan your bigger
            batch jobs accordingly!
          </Text>

          <Hr style={divider} />

          <Text style={footerText}>Questions about your purchase? Just reply to this email.</Text>

          <Text style={footerSignature}>
            Thanks for supporting PromptQueue!
            <br />
            The PromptQueue Team
          </Text>

          <Section style={footerLinks}>
            <Link href="https://yosefhayimsabag.com/prompt-queue" style={footerLink}>
              Website
            </Link>
            <Text style={footerLinkDivider}>•</Text>
            <Link href="https://yosefhayimsabag.com/prompt-queue/privacy" style={footerLink}>
              Privacy
            </Link>
            <Text style={footerLinkDivider}>•</Text>
            <Link href="https://yosefhayimsabag.com/prompt-queue/terms" style={footerLink}>
              Terms
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 20px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  margin: "0 auto",
  maxWidth: "520px",
  padding: "48px 40px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const logoText = {
  color: "#10b981",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: "0",
};

const celebrationSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const celebrationEmoji = {
  fontSize: "48px",
  margin: "0",
};

const heading = {
  color: "#111827",
  fontSize: "26px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 28px",
  textAlign: "center" as const,
};

const successBox = {
  backgroundColor: "#ecfdf5",
  borderRadius: "12px",
  margin: "0 0 32px",
  padding: "28px",
  textAlign: "center" as const,
};

const successTitle = {
  color: "#065f46",
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const successNumber = {
  color: "#10b981",
  fontSize: "56px",
  fontWeight: "700",
  lineHeight: "1",
  margin: "0",
};

const successLabel = {
  color: "#065f46",
  fontSize: "16px",
  margin: "8px 0 0",
};

const benefitsSection = {
  margin: "0 0 32px",
};

const benefitsTitle = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const benefitItem = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 10px",
};

const checkmark = {
  color: "#10b981",
  fontWeight: "600",
  marginRight: "8px",
};

const divider = {
  borderColor: "#e5e7eb",
  borderTop: "1px solid #e5e7eb",
  margin: "28px 0",
};

const tipText = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  padding: "16px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const footerSignature = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const footerLinks = {
  textAlign: "center" as const,
};

const footerLink = {
  color: "#9ca3af",
  fontSize: "12px",
  textDecoration: "none",
};

const footerLinkDivider = {
  color: "#d1d5db",
  display: "inline",
  fontSize: "12px",
  margin: "0 8px",
};

export default SubscriptionConfirmedEmail;

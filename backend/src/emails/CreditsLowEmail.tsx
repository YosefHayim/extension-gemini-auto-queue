import {
  Body,
  Button,
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

interface CreditsLowEmailProps {
  creditsRemaining: number;
}

export function CreditsLowEmail({ creditsRemaining }: CreditsLowEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Only {String(creditsRemaining)} prompt{creditsRemaining === 1 ? "" : "s"} left today
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>PromptQueue</Text>
          </Section>

          <Section style={alertBadge}>
            <Text style={alertBadgeText}>Daily Limit Alert</Text>
          </Section>

          <Heading style={heading}>Running low on prompts</Heading>

          <Text style={paragraph}>
            You have <strong>{creditsRemaining}</strong> prompt{creditsRemaining === 1 ? "" : "s"}{" "}
            remaining for today. Your limit resets at midnight UTC.
          </Text>

          <Section style={warningBox}>
            <Text style={warningNumber}>{creditsRemaining}</Text>
            <Text style={warningLabel}>prompts left today</Text>
          </Section>

          <Hr style={divider} />

          <Section style={upgradeSection}>
            <Text style={upgradeTitle}>Want unlimited generations?</Text>
            <Text style={upgradeText}>
              Get <strong>Lifetime Pro</strong> for just <strong>$1</strong> - unlimited access forever.
              One payment, no subscriptions, no recurring fees.
            </Text>

            <Button style={ctaButton} href="https://yosefhayimsabag.com/prompt-queue/upgrade">
              Upgrade to Lifetime - $1
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footerText}>Go Pro Lifetime for just $1 - unlimited access forever!</Text>

          <Section style={footerLinks}>
            <Link href="https://yosefhayimsabag.com/prompt-queue" style={footerLink}>
              Website
            </Link>
            <Text style={footerLinkDivider}>•</Text>
            <Link href="https://yosefhayimsabag.com/prompt-queue/privacy" style={footerLink}>
              Privacy
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
  marginBottom: "24px",
};

const logoText = {
  color: "#10b981",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: "0",
};

const alertBadge = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const alertBadgeText = {
  backgroundColor: "#fef3c7",
  borderRadius: "20px",
  color: "#92400e",
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "0",
  padding: "6px 16px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const warningBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "12px",
  margin: "0 0 32px",
  padding: "24px",
  textAlign: "center" as const,
};

const warningNumber = {
  color: "#b45309",
  fontSize: "48px",
  fontWeight: "700",
  lineHeight: "1",
  margin: "0",
};

const warningLabel = {
  color: "#92400e",
  fontSize: "14px",
  margin: "8px 0 0",
};

const divider = {
  borderColor: "#e5e7eb",
  borderTop: "1px solid #e5e7eb",
  margin: "32px 0",
};

const upgradeSection = {
  textAlign: "center" as const,
};

const upgradeTitle = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const upgradeText = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0 0 24px",
};

const ctaButton = {
  backgroundColor: "#10b981",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 16px",
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

export default CreditsLowEmail;

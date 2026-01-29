import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string | null;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const displayName = name ?? "there";

  return (
    <Html>
      <Head />
      <Preview>Welcome to PromptQueue - Automate your Gemini workflow</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>PromptQueue</Text>
          </Section>

          <Heading style={heading}>Welcome aboard, {displayName}!</Heading>

          <Text style={paragraph}>
            You just unlocked the fastest way to work with Google Gemini. Queue prompts, automate
            workflows, and download results - all hands-free.
          </Text>

          <Section style={statsBox}>
            <Text style={statsTitle}>Your 14-Day Free Trial</Text>
            <Text style={statsNumber}>∞</Text>
            <Text style={statsLabel}>unlimited access</Text>
          </Section>

          <Text style={paragraph}>Here&apos;s what you can do right now:</Text>

          <Section style={featureSection}>
            <Text style={featureItem}>
              <span style={checkmark}>✓</span> Queue multiple prompts and process them automatically
            </Text>
            <Text style={featureItem}>
              <span style={checkmark}>✓</span> Select tools like Image, Video, Canvas, Deep Research
            </Text>
            <Text style={featureItem}>
              <span style={checkmark}>✓</span> Attach reference images to your prompts
            </Text>
            <Text style={featureItem}>
              <span style={checkmark}>✓</span> Schedule queue processing for later
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={upgradeSection}>
            <Text style={upgradeTitle}>Love it? Go Pro for just $1!</Text>
            <Text style={upgradeText}>
              After your trial, keep <strong>unlimited access forever</strong> with{" "}
              <strong>Lifetime Pro</strong> for just <strong style={priceHighlight}>$1</strong>:
            </Text>

            <Section style={upgradeFeatures}>
              <Text style={upgradeFeatureItem}>
                <span style={starIcon}>★</span> Unlimited generations forever
              </Text>
              <Text style={upgradeFeatureItem}>
                <span style={starIcon}>★</span> Priority support
              </Text>
              <Text style={upgradeFeatureItem}>
                <span style={starIcon}>★</span> All future updates included
              </Text>
              <Text style={upgradeFeatureItem}>
                <span style={starIcon}>★</span> Pay once, use forever
              </Text>
            </Section>

            <Button style={ctaButton} href="https://yosefhayimsabag.com/prompt-queue/upgrade">
              Upgrade to Lifetime - $1
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footerText}>
            Questions? Just reply to this email. We read every message.
          </Text>

          <Text style={footerSignature}>
            Happy prompting!
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
  marginBottom: "32px",
};

const logoText = {
  color: "#10b981",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: "0",
};

const heading = {
  color: "#111827",
  fontSize: "26px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const statsBox = {
  backgroundColor: "#ecfdf5",
  borderRadius: "12px",
  margin: "0 0 32px",
  padding: "24px",
  textAlign: "center" as const,
};

const statsTitle = {
  color: "#065f46",
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const statsNumber = {
  color: "#10b981",
  fontSize: "48px",
  fontWeight: "700",
  lineHeight: "1",
  margin: "0",
};

const statsLabel = {
  color: "#065f46",
  fontSize: "16px",
  margin: "8px 0 0",
};

const featureSection = {
  margin: "0 0 32px",
};

const featureItem = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
  paddingLeft: "4px",
};

const checkmark = {
  color: "#10b981",
  fontWeight: "600",
  marginRight: "8px",
};

const divider = {
  borderColor: "#e5e7eb",
  borderTop: "1px solid #e5e7eb",
  margin: "32px 0",
};

const upgradeSection = {
  backgroundColor: "#fefce8",
  borderRadius: "12px",
  margin: "0 0 32px",
  padding: "28px 24px",
  textAlign: "center" as const,
};

const upgradeTitle = {
  color: "#854d0e",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const upgradeText = {
  color: "#713f12",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0 0 20px",
};

const priceHighlight = {
  color: "#ca8a04",
  fontSize: "18px",
};

const upgradeFeatures = {
  margin: "0 0 24px",
  textAlign: "left" as const,
};

const upgradeFeatureItem = {
  color: "#713f12",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const starIcon = {
  color: "#eab308",
  marginRight: "8px",
};

const ctaButton = {
  backgroundColor: "#ca8a04",
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

export default WelcomeEmail;

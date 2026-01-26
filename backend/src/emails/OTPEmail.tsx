import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OTPEmailProps {
  otp: string;
}

export function OTPEmail({ otp }: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>Gqmini</Text>
          </Section>

          <Heading style={heading}>Verify your email</Heading>

          <Text style={paragraph}>Enter this code to sign in to Gqmini:</Text>

          <Section style={codeContainer}>
            <Text style={code}>{otp}</Text>
          </Section>

          <Text style={expiryText}>This code expires in 10 minutes.</Text>

          <Text style={footerText}>
            If you didn&apos;t request this code, you can safely ignore this email.
          </Text>

          <Section style={footerLinks}>
            <Link href="https://gqmini.example.com" style={footerLink}>
              Website
            </Link>
            <Text style={footerLinkDivider}>•</Text>
            <Link href="https://gqmini.example.com/privacy" style={footerLink}>
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
  maxWidth: "480px",
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
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const codeContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "12px",
  marginBottom: "16px",
  padding: "24px",
  textAlign: "center" as const,
};

const code = {
  color: "#111827",
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
};

const expiryText = {
  color: "#9ca3af",
  fontSize: "14px",
  margin: "0 0 32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
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

export default OTPEmail;

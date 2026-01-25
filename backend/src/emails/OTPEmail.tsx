import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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
          <Heading style={heading}>Verify your email</Heading>
          <Text style={paragraph}>Enter this code to sign in to Groove:</Text>
          <Section style={codeContainer}>
            <Text style={code}>{otp}</Text>
          </Section>
          <Text style={footer}>
            This code expires in 10 minutes. If you didn&apos;t request this code, you can safely
            ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  padding: "40px 20px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "40px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 24px",
};

const paragraph = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 24px",
};

const codeContainer = {
  backgroundColor: "#f0f0f0",
  borderRadius: "8px",
  marginBottom: "24px",
  padding: "20px",
  textAlign: "center" as const,
};

const code = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "8px",
  margin: "0",
};

const footer = {
  color: "#999999",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

export default OTPEmail;

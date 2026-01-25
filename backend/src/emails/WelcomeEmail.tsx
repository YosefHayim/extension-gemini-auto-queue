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

interface WelcomeEmailProps {
  name: string | null;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const displayName = name ?? "there";

  return (
    <Html>
      <Head />
      <Preview>Welcome to Groove - You have 100 free credits!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to Groove!</Heading>
          <Text style={paragraph}>Hi {displayName},</Text>
          <Text style={paragraph}>
            You&apos;re all set! You have <strong>100 free credits</strong> to try out all features.
          </Text>
          <Section style={featureBox}>
            <Text style={featureText}>
              <strong>What you can do:</strong>
            </Text>
            <Text style={featureList}>• Queue and batch process prompts</Text>
            <Text style={featureList}>• Generate images and videos</Text>
            <Text style={featureList}>• Use all Gemini tools automatically</Text>
          </Section>
          <Text style={footer}>Need more? Upgrade to unlimited for just $2/month.</Text>
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
  margin: "0 0 16px",
};

const featureBox = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  borderRadius: "8px",
  marginBottom: "24px",
  padding: "20px",
};

const featureText = {
  color: "#ffffff",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const featureList = {
  color: "#ffffff",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

const footer = {
  color: "#999999",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

export default WelcomeEmail;

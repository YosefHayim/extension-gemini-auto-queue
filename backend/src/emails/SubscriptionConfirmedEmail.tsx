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

interface SubscriptionConfirmedEmailProps {
  planName: string;
}

export function SubscriptionConfirmedEmail({ planName }: SubscriptionConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {planName} subscription is now active!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Subscription Active!</Heading>
          <Text style={paragraph}>
            Your <strong>{planName}</strong> subscription is now active. You have unlimited access
            to all features!
          </Text>
          <Section style={successBox}>
            <Text style={successText}>✓ Unlimited queue processing</Text>
            <Text style={successText}>✓ All Gemini tools</Text>
            <Text style={successText}>✓ Priority support</Text>
          </Section>
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

const successBox = {
  backgroundColor: "#d1fae5",
  borderRadius: "8px",
  marginBottom: "24px",
  padding: "20px",
};

const successText = {
  color: "#065f46",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

export default SubscriptionConfirmedEmail;

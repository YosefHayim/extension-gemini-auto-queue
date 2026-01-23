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

interface CreditsLowEmailProps {
  creditsRemaining: number;
}

export function CreditsLowEmail({ creditsRemaining }: CreditsLowEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You have {String(creditsRemaining)} credits remaining</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Running low on credits</Heading>
          <Text style={paragraph}>
            You have <strong>{creditsRemaining} credits</strong> remaining on your free plan.
          </Text>
          <Section style={warningBox}>
            <Text style={warningText}>
              Upgrade to get <strong>unlimited</strong> usage for just $2/month or $16/year.
            </Text>
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

const warningBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  marginBottom: "24px",
  padding: "20px",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

export default CreditsLowEmail;

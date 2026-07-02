import {
  Html as BaseHtml,
  Body as BaseBody,
  Container as BaseContainer,
  Text as BaseText,
  Heading as BaseHeading,
  Preview as BasePreview,
  Head as BaseHead,
  Section as BaseSection,
  Row as BaseRow,
  Img as BaseImg,
} from '@react-email/components';

const Html = BaseHtml as any;
const Head = BaseHead as any;
const Section = BaseSection as any;
const Row = BaseRow as any;
const Body = BaseBody as any;
const Container = BaseContainer as any;
const Text = BaseText as any;
const Heading = BaseHeading as any;
const Preview = BasePreview as any;
const Img = BaseImg as any;

export interface AffiliateCommissionEmailProps {
  name: string;
  avatar_url?: string;
  earned_commission: number;
  current_pending_commission: number;
  total_paid_commission: number;
  commission_percentage: number;
  order_id: string | number;
  promo_code: string;
  order_subtotal: number;
  order_items: string;
}

const AffiliateCommissionEmail = ({
  name,
  avatar_url,
  earned_commission,
  current_pending_commission,
  total_paid_commission,
  commission_percentage,
  order_id,
  promo_code,
  order_subtotal,
  order_items,
}: AffiliateCommissionEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        You earned {earned_commission} EGP commission on order #{order_id}!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerTitle}>PlanBlue Affiliate Program</Heading>
            <Text style={headerSubtitle}>
              Great news — you just earned a new commission!
            </Text>
          </Section>

          <Section style={contentSection}>
            <Section style={profileSection}>
              {avatar_url ? (
                <Img
                  src={avatar_url}
                  alt={name}
                  width={72}
                  height={72}
                  style={avatarImage}
                />
              ) : (
                <Section style={avatarPlaceholder}>
                  <Text style={avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
                </Section>
              )}
              <Text style={welcomeText}>Congratulations, {name}! 🎉</Text>
            </Section>

            <Text style={paragraph}>
              An order using your promo code was successfully delivered. Your
              commission has been added to your pending balance — keep sharing
              your code to earn even more!
            </Text>

            <Section style={highlightCard}>
              <Text style={highlightLabel}>Commission earned on this order</Text>
              <Text style={highlightValue}>{earned_commission} EGP</Text>
              <Text style={highlightSubtext}>
                {commission_percentage}% of {order_subtotal} EGP subtotal
              </Text>
            </Section>

            <Section style={statsRow}>
              <Section style={statCard}>
                <Text style={statLabel}>Pending Commission</Text>
                <Text style={statValue}>{current_pending_commission} EGP</Text>
              </Section>
              <Section style={statCard}>
                <Text style={statLabel}>Total Paid Out</Text>
                <Text style={statValue}>{total_paid_commission} EGP</Text>
              </Section>
            </Section>

            <Section style={orderCard}>
              <Text style={cardTitle}>Order Details</Text>
              <Row style={orderRow}>
                <Text style={rowLabel}>Order ID</Text>
                <Text style={rowValue}>#{order_id}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Promo Code Used</Text>
                <Text style={rowValue}>{promo_code}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Order Subtotal</Text>
                <Text style={rowValue}>{order_subtotal} EGP</Text>
              </Row>
              <Row style={orderRowLast}>
                <Text style={rowLabel}>Products</Text>
                <Text style={itemsValue}>{order_items}</Text>
              </Row>
            </Section>

            <Text style={motivationText}>
              Every successful order brings you closer to your next payout. Thank
              you for being a valued PlanBlue affiliate!
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>© 2026 PlanBlue Store. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AffiliateCommissionEmail;

const main = {
  backgroundColor: '#f4f7fc',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '40px auto',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  border: '1px solid #eef2f6',
};

const headerSection = {
  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  margin: '0',
  fontSize: '26px',
  fontWeight: '700',
};

const headerSubtitle = {
  color: '#ffffff',
  margin: '10px 0 0 0',
  fontSize: '15px',
  opacity: '0.9',
};

const contentSection = {
  padding: '30px',
};

const profileSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const avatarImage = {
  borderRadius: '50%',
  margin: '0 auto 16px auto',
  border: '3px solid #d1fae5',
};

const avatarPlaceholder = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  backgroundColor: '#059669',
  margin: '0 auto 16px auto',
  textAlign: 'center' as const,
};

const avatarInitial = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '72px',
  margin: '0',
};

const welcomeText = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111111',
  margin: '0',
};

const paragraph = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const highlightCard = {
  backgroundColor: '#ecfdf5',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #a7f3d0',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const highlightLabel = {
  color: '#047857',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const highlightValue = {
  color: '#065f46',
  fontSize: '36px',
  fontWeight: '800',
  margin: '0',
};

const highlightSubtext = {
  color: '#059669',
  fontSize: '13px',
  margin: '8px 0 0 0',
};

const statsRow = {
  marginBottom: '24px',
};

const statCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  padding: '16px',
  border: '1px solid #edf2f7',
  marginBottom: '12px',
  textAlign: 'center' as const,
};

const statLabel = {
  color: '#64748b',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0 0 6px 0',
};

const statValue = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0',
};

const orderCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #edf2f7',
  marginBottom: '24px',
};

const cardTitle = {
  fontWeight: '700',
  fontSize: '16px',
  color: '#0f172a',
  margin: '0 0 15px 0',
};

const orderRow = {
  borderBottom: '1px solid #edf2f7',
  padding: '10px 0',
};

const orderRowLast = {
  padding: '10px 0 0 0',
};

const rowLabel = {
  color: '#64748b',
  fontWeight: '500',
  fontSize: '14px',
  margin: '0',
  float: 'left' as const,
};

const rowValue = {
  color: '#0f172a',
  fontWeight: '600',
  fontSize: '14px',
  margin: '0',
  float: 'right' as const,
};

const itemsValue = {
  color: '#0f172a',
  fontWeight: '600',
  fontSize: '14px',
  margin: '8px 0 0 0',
  whiteSpace: 'pre-line' as const,
  clear: 'both' as const,
};

const motivationText = {
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'center' as const,
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic' as const,
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '20px',
  borderTop: '1px solid #eef2f6',
  backgroundColor: '#fafafa',
};

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
};

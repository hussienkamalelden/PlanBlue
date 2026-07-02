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
  Link as BaseLink,
} from '@react-email/components';

// Casting components to bypass strict type nesting limits if necessary
const Html = BaseHtml as any;
const Head = BaseHead as any;
const Section = BaseSection as any;
const Row = BaseRow as any;
const Body = BaseBody as any;
const Container = BaseContainer as any;
const Text = BaseText as any;
const Heading = BaseHeading as any;
const Preview = BasePreview as any;
const Link = BaseLink as any;

interface AdminEmailProps {
  name: string;
  order_id: string | number;
  subtotal: number;
  discount_amount: number;
  promo_discount_percentage: number;
  shipping_cost: number;
  gift_wrapping: boolean;
  gift_wrapping_cost: number;
  total: number;
  phone: string;
  address: string;
  extra_notes: string;
  order_items: string;
  governorate: string;
  promo_code: string;
}

const AdminOrderEmail = ({
  name,
  order_id,
  subtotal,
  discount_amount,
  promo_discount_percentage,
  shipping_cost,
  gift_wrapping,
  gift_wrapping_cost,
  total,
  phone,
  address,
  extra_notes,
  order_items,
  governorate,
  promo_code,
}: AdminEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        🚨 New Order Received! Order #{order_id} • Total: {total} EGP
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={headerSection}>
            <Heading style={headerTitle}>PlanBlue Control Panel</Heading>
            <Text style={headerSubtitle}>
              Automated System Alert: A new order has been logged successfully
              🚀
            </Text>
          </Section>

          {/* Main Content Body */}
          <Section style={contentSection}>
            {/* Urgency/Status Badge */}
            <Section style={badgeContainer}>
              <Text style={statusBadge}>📦 New Order Awaiting Fulfillment</Text>
            </Section>

            <Text style={paragraph}>
              Customer <strong>{name}</strong> has just completed a new checkout
              session on the storefront. Please review the customer manifest and
              shipping payload below to begin processing the package.
            </Text>

            {/* Order Details Manifest Card */}
            <Section style={orderCard}>
              <Text style={cardTitle}>Customer & Shipping Manifesto:</Text>

              <Row style={orderRow}>
                <Text style={rowLabel}>Order ID</Text>
                <Text style={rowValue}>#{order_id}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Customer Name</Text>
                <Text style={rowValue}>{name}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Phone Number</Text>
                <Text style={rowValue}>{phone}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Governorate</Text>
                <Text style={rowValue}>{governorate}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Destination Address</Text>
                <Text style={rowValue}>{address}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Purchased Items</Text>
                <Text style={itemsValue}>{order_items}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Promo Code</Text>
                <Text style={rowValue}>{promo_code}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Customer Notes</Text>
                <Text style={rowValue}>
                  {extra_notes || 'No special requirements specified'}
                </Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Subtotal</Text>
                <Text style={rowValue}>{subtotal} EGP</Text>
              </Row>
              {discount_amount > 0 && (
                <Row style={orderRow}>
                  <Text style={rowLabel}>Discount ({promo_discount_percentage}%)</Text>
                  <Text style={{ ...rowValue, color: '#16a34a' }}>-{discount_amount} EGP</Text>
                </Row>
              )}
              <Row style={orderRow}>
                <Text style={rowLabel}>Shipping ({governorate})</Text>
                <Text style={rowValue}>{shipping_cost} EGP</Text>
              </Row>
              {gift_wrapping && (
                <Row style={orderRow}>
                  <Text style={rowLabel}>Gift Wrapping</Text>
                  <Text style={rowValue}>{gift_wrapping_cost} EGP</Text>
                </Row>
              )}

              {/* Financial Capture Total */}
              <Row style={totalRow}>
                <Text style={totalLabel}>Total Amount to Collect</Text>
                <Text style={totalValue}>{total} EGP</Text>
              </Row>
            </Section>
          </Section>

          {/* Email Footer metadata */}
          <Section style={footerSection}>
            <Text style={footerText}>
              PlanBlue Store Automation Engine • Generated programmatically via
              Strapi Lifecycle Hooks & Resend
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminOrderEmail;

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '40px auto',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
  border: '1px solid #e2e8f0',
};

const headerSection = {
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Premium corporate dark slate palette
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#f8fafc',
  margin: '0',
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '0.5px',
};

const headerSubtitle = {
  color: '#94a3b8',
  margin: '10px 0 0 0',
  fontSize: '14px',
};

const contentSection = {
  padding: '30px',
};

const badgeContainer = {
  marginBottom: '20px',
};

const statusBadge = {
  display: 'inline-block',
  backgroundColor: '#ffedd5',
  color: '#ea580c', // High-contrast safety orange alert color
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '700',
  margin: '0',
};

const paragraph = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 25px 0',
};

const orderCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  marginBottom: '25px',
};

const cardTitle = {
  fontWeight: '700',
  fontSize: '15px',
  color: '#1e293b',
  margin: '0 0 15px 0',
};

const orderRow = {
  borderBottom: '1px solid #e2e8f0',
  padding: '12px 0',
};

const rowLabel = {
  color: '#64748b',
  fontWeight: '600',
  fontSize: '13px',
  margin: '0',
  float: 'left' as const,
};

const rowValue = {
  color: '#0f172a',
  fontWeight: '500',
  fontSize: '13px',
  margin: '0',
  float: 'right' as const,
};

const itemsValue = {
  color: '#0f172a',
  fontWeight: '500',
  fontSize: '13px',
  margin: '8px 0 0 0',
  whiteSpace: 'pre-line' as const,
  clear: 'both' as const,
};

const totalRow = {
  backgroundColor: '#0f172a',
  padding: '15px',
  borderRadius: '8px',
  marginTop: '15px',
};

const totalLabel = {
  color: '#94a3b8',
  fontWeight: '600',
  fontSize: '14px',
  float: 'left' as const,
  margin: '0',
};

const totalValue = {
  color: '#38bdf8', // Bright cyan highlight for transaction totals
  fontWeight: '700',
  fontSize: '16px',
  float: 'right' as const,
  margin: '0',
};

const button = {
  backgroundColor: '#0284c7',
  color: '#ffffff',
  padding: '14px 24px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
};

const containerFooter = {
  textAlign: 'center' as const,
  padding: '20px',
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '20px',
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
};

const footerText = {
  fontSize: '11px',
  color: '#94a3b8',
  margin: '0',
};

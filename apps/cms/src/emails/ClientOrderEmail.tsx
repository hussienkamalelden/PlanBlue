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

interface EmailProps {
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

const ClientOrderEmail = ({
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
}: EmailProps) => {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>
        Thank you for your order from PlanBlue! Your order ID is #{order_id}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={headerTitle}>PlanBlue Store</Heading>
            <Text style={headerSubtitle}>
              Thank you for your trust in us and your order from our store
            </Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={welcomeText}>Hello {name} 👋</Text>
            <Text style={paragraph}>
              Your order has been received and is currently being processed by
              our team. We will send you the shipping details as soon as the
              order is dispatched.
            </Text>
            {/* Order Details Card */}
            <Section style={orderCard}>
              <Text style={cardTitle}>Order Details:</Text>
              <Row style={orderRow}>
                <Text style={rowLabel}>Order ID</Text>
                <Text style={rowValue}>#{order_id}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Phone</Text>
                <Text style={rowValue}>{phone}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Governorate</Text>
                <Text style={rowValue}>{governorate}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Address</Text>
                <Text style={rowValue}>{address}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Extra Notes</Text>
                <Text style={rowValue}>{extra_notes}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Order Items</Text>
                <Text style={itemsValue}>{order_items}</Text>
              </Row>
              <Row style={orderRow}>
                <Text style={rowLabel}>Promo Code</Text>
                <Text style={rowValue}>{promo_code}</Text>
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
              {/* Total */}
              <Row style={totalRow}>
                <Text style={totalLabel}>Total</Text>
                <Text style={totalValue}>{total} EGP</Text>
              </Row>
            </Section>
            <Text style={noticeText}>
              If you have any questions, we are always here to serve you
              directly through planbluestore@gmail.com
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © 2026 PlanBlue Store. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ClientOrderEmail;

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
  background: 'linear-gradient(135deg, #0052cc 0%, #003399 100%)',
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

const welcomeText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111111',
  margin: '0 0 15px 0',
};

const paragraph = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const orderCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #edf2f7',
  marginBottom: '30px',
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

const totalRow = {
  backgroundColor: '#0052cc',
  padding: '15px',
  borderRadius: '8px',
  marginTop: '15px',
};

const totalLabel = {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '16px',
  margin: '0',
  float: 'left' as const,
};

const totalValue = {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '16px',
  float: 'right' as const,
  margin: '0',
};

const noticeText = {
  fontSize: '13px',
  color: '#64748b',
  textAlign: 'center' as const,
  margin: '0',
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

const footerSubtext = {
  fontSize: '11px',
  color: '#cbd5e1',
  margin: '5px 0 0 0',
};

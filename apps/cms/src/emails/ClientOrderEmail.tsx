import {
  Html as BaseHtml,
  Body as BaseBody,
  Container as BaseContainer,
  Text as BaseText,
  Preview as BasePreview,
  Head as BaseHead,
  Section as BaseSection,
  Row as BaseRow,
  Column as BaseColumn,
  Img as BaseImg,
} from '@react-email/components';

const Html = BaseHtml as any;
const Head = BaseHead as any;
const Section = BaseSection as any;
const Row = BaseRow as any;
const Column = BaseColumn as any;
const Body = BaseBody as any;
const Container = BaseContainer as any;
const Text = BaseText as any;
const Preview = BasePreview as any;
const Img = BaseImg as any;

const BRAND = {
  lightBlue: '#4389F7',
  navy: '#1B3A6B',
  amber: '#F5B82E',
  green: '#16a34a',
  bg: '#f0f6ff',
  cardBg: '#ffffff',
  cardBorder: '#dbeafe',
  muted: '#64748b',
  text: '#1e293b',
};

type OrderItemLine = {
  title: string;
  quantity: number;
  lineTotal: number;
};

type BatteryLine = {
  size: string;
  quantity: number;
};

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
  order_items_list?: OrderItemLine[];
  governorate: string;
  promo_code: string;
  is_update?: boolean;
  batteries_summary?: string;
  batteries_list?: BatteryLine[];
}

function SplitRow({
  left,
  right,
  leftStyle,
  rightStyle,
  isLast = false,
}: {
  left: string;
  right: string;
  leftStyle?: Record<string, string | number>;
  rightStyle?: Record<string, string | number>;
  isLast?: boolean;
}) {
  return (
    <Row style={{ ...splitRow, ...(isLast ? splitRowLast : {}) }}>
      <Column align="left" style={splitLeftCol}>
        <Text style={{ ...splitLeftText, ...leftStyle }}>{left}</Text>
      </Column>
      <Column align="right" style={splitRightCol}>
        <Text style={{ ...splitRightText, ...rightStyle }}>{right}</Text>
      </Column>
    </Row>
  );
}

function DetailRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: Record<string, string | number>;
}) {
  return (
    <SplitRow
      left={label}
      right={value}
      leftStyle={detailLabelText}
      rightStyle={{ ...detailValueText, ...valueStyle }}
    />
  );
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
  order_items_list = [],
  governorate,
  promo_code,
  is_update = false,
  batteries_list = [],
}: EmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {is_update
          ? `PlanBlue order #${order_id} updated · Total ${total} EGP`
          : `PlanBlue order #${order_id} confirmed · Total ${total} EGP`}
      </Preview>
      <Body style={main}>
        <Section style={hiddenPreheader}>
          <Text style={hiddenPreheaderText}>
            {`planblue-order-${order_id}-${total}-${is_update ? 'update' : 'confirm'}-${name}`}
          </Text>
        </Section>
        <Container style={container}>
          <Section style={headerSection}>
            <Img
              src="https://pub-eb8249647a93431092ad3c6652a821b0.r2.dev/full_logo_68ca0dff54.png"
              width="240"
              alt="PlanBlue"
              style={logo}
            />
          </Section>

          <Section style={contentSection}>
            {is_update && (
              <Section style={updateBanner}>
                <Text style={updateBannerText}>Your order has been updated</Text>
              </Section>
            )}

            <Text style={welcomeText}>Hello {name} 👋</Text>
            <Text style={paragraph}>
              {is_update
                ? 'Your order details have been updated. Please review the latest information below.'
                : 'Your order has been received and is currently being processed by our team.'}
            </Text>

            <Section style={orderCard}>
              <Text style={cardTitle}>Order Details</Text>

              <DetailRow label="Order ID" value={`#${order_id}`} />
              <DetailRow label="Phone" value={phone} />
              <DetailRow label="Governorate" value={governorate} />
              <DetailRow label="Address" value={address} />
              <DetailRow label="Extra Notes" value={extra_notes || '—'} />

              <Section style={listSection}>
                <Text style={listSectionTitle}>Order Items</Text>
                {order_items_list.map((item, index) => (
                  <SplitRow
                    key={`item-${index}`}
                    left={`${item.title} × ${item.quantity}`}
                    right={`${item.lineTotal} EGP`}
                    leftStyle={listLeftText}
                    rightStyle={itemPriceText}
                    isLast={index === order_items_list.length - 1}
                  />
                ))}
              </Section>

              <DetailRow label="Promo Code" value={promo_code || '—'} />
              <DetailRow label="Subtotal" value={`${subtotal} EGP`} />

              {discount_amount > 0 && (
                <DetailRow
                  label={`Discount (${promo_discount_percentage}%)`}
                  value={`-${discount_amount} EGP`}
                  valueStyle={discountValueText}
                />
              )}

              {batteries_list.length > 0 && (
                <Section style={listSection}>
                  <Text style={listSectionTitle}>Batteries</Text>
                  {batteries_list.map((battery, index) => (
                    <SplitRow
                      key={`battery-${index}`}
                      left={battery.size}
                      right={`× ${battery.quantity}`}
                      leftStyle={listLeftText}
                      rightStyle={discountValueText}
                      isLast={index === batteries_list.length - 1}
                    />
                  ))}
                </Section>
              )}

              <DetailRow
                label={`Shipping (${governorate})`}
                value={`${shipping_cost} EGP`}
              />

              {gift_wrapping && (
                <DetailRow
                  label="Gift Wrapping"
                  value={`${gift_wrapping_cost} EGP`}
                />
              )}

              <Row style={totalRow}>
                <Column align="left" style={splitLeftCol}>
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column align="right" style={splitRightCol}>
                  <Text style={totalValue}>{total} EGP</Text>
                </Column>
              </Row>
            </Section>

            <Text style={noticeText}>
              If you have any questions, we are always here to serve you directly
              through planbluestore@gmail.com
            </Text>
          </Section>

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
  backgroundColor: BRAND.bg,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  padding: '24px 12px',
  direction: 'ltr' as const,
};

const container = {
  backgroundColor: BRAND.cardBg,
  maxWidth: '600px',
  margin: '0 auto',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(67, 137, 247, 0.12)',
  border: `1px solid ${BRAND.cardBorder}`,
};

const hiddenPreheader = {
  display: 'none',
  maxHeight: '0px',
  overflow: 'hidden',
  opacity: 0,
  fontSize: '1px',
  lineHeight: '1px',
  msoHide: 'all',
};

const hiddenPreheaderText = {
  color: '#f0f6ff',
  margin: '0',
  padding: '0',
  fontSize: '1px',
  lineHeight: '1px',
};

const headerSection = {
  background: `linear-gradient(180deg, ${BRAND.bg} 0%, ${BRAND.cardBg} 100%)`,
  padding: '32px 24px 24px',
  textAlign: 'center' as const,
  borderBottom: `1px solid ${BRAND.cardBorder}`,
};

const logo = {
  display: 'block',
  margin: '0 auto',
  maxWidth: '100%',
  height: 'auto',
};

const contentSection = {
  padding: '28px 24px 32px',
};

const updateBanner = {
  backgroundColor: '#fff8e6',
  border: `1px solid ${BRAND.amber}`,
  borderRadius: '12px',
  padding: '12px 16px',
  marginBottom: '20px',
};

const updateBannerText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
};

const welcomeText = {
  fontSize: '20px',
  fontWeight: '700',
  color: BRAND.navy,
  margin: '0 0 8px 0',
};

const paragraph = {
  color: BRAND.muted,
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const orderCard = {
  backgroundColor: BRAND.bg,
  borderRadius: '16px',
  padding: '20px',
  border: `1px solid ${BRAND.cardBorder}`,
  marginBottom: '24px',
};

const cardTitle = {
  fontWeight: '700',
  fontSize: '16px',
  color: BRAND.navy,
  margin: '0 0 12px 0',
};

const splitRow = {
  borderBottom: `1px solid ${BRAND.cardBorder}`,
  padding: '8px 0',
  width: '100%',
};

const splitRowLast = {
  borderBottom: 'none',
  paddingBottom: '0',
};

const splitLeftCol = {
  width: '60%',
  verticalAlign: 'top' as const,
  paddingRight: '12px',
};

const splitRightCol = {
  width: '40%',
  verticalAlign: 'top' as const,
  paddingLeft: '12px',
};

const splitLeftText = {
  color: BRAND.text,
  fontWeight: '600',
  fontSize: '14px',
  margin: '0',
  textAlign: 'left' as const,
  lineHeight: '1.4',
};

const splitRightText = {
  color: BRAND.text,
  fontWeight: '600',
  fontSize: '14px',
  margin: '0',
  textAlign: 'right' as const,
  lineHeight: '1.4',
};

const detailLabelText = {
  color: BRAND.muted,
  fontWeight: '500',
};

const detailValueText = {
  color: BRAND.text,
  fontWeight: '600',
};

const listSection = {
  borderBottom: `1px solid ${BRAND.cardBorder}`,
  padding: '0 0 8px',
  marginBottom: '4px',
};

const listSectionTitle = {
  color: BRAND.muted,
  fontWeight: '600',
  fontSize: '14px',
  margin: '8px 0 2px 0',
  textAlign: 'left' as const,
};

const listLeftText = {
  color: BRAND.text,
  fontWeight: '600',
};

const itemPriceText = {
  color: BRAND.lightBlue,
  fontWeight: '700',
};

const discountValueText = {
  color: BRAND.green,
  fontWeight: '600',
  fontSize: '14px',
};

const totalRow = {
  background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.lightBlue} 100%)`,
  padding: '16px 14px',
  borderRadius: '12px',
  marginTop: '16px',
  borderBottom: 'none',
};

const totalLabel = {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '20px',
  margin: '0',
  textAlign: 'left' as const,
  lineHeight: '1.2',
};

const totalValue = {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '24px',
  margin: '0',
  textAlign: 'right' as const,
  lineHeight: '1.2',
};

const noticeText = {
  fontSize: '13px',
  color: BRAND.muted,
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.6',
};

const footerSection = {
  textAlign: 'center' as const,
  padding: '16px 24px 20px',
  borderTop: `1px solid ${BRAND.cardBorder}`,
  backgroundColor: BRAND.bg,
};

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
};

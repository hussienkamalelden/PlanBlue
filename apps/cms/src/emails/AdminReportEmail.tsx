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

type StatusBreakdown = {
  status: string;
  value: number;
};

type OrderDetail = {
  orderId: string;
  subtotal: number;
  shipping: number;
  discount: number;
  giftWrapping: number;
};

type OrderIdsByStatus = {
  status: string;
  orders: OrderDetail[];
};

interface AdminReportEmailProps {
  fromDate: string;
  toDate: string;
  subtotalByStatus: StatusBreakdown[];
  shippingByStatus: StatusBreakdown[];
  affiliateDiscountDelivered: number;
  clientDiscountByStatus: StatusBreakdown[];
  giftWrappingByStatus: StatusBreakdown[];
  orderCountByStatus: StatusBreakdown[];
  orderIdsByStatus: OrderIdsByStatus[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function formatCurrency(value: number): string {
  return `${value.toFixed(2)} ج.م`;
}

const AdminReportEmail = ({
  fromDate,
  toDate,
  subtotalByStatus,
  shippingByStatus,
  affiliateDiscountDelivered,
  clientDiscountByStatus,
  giftWrappingByStatus,
  orderCountByStatus,
  orderIdsByStatus,
}: AdminReportEmailProps) => {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>
        تقرير الطلبات من {fromDate} إلى {toDate}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={headerTitle}>PlanBlue — تقرير الطلبات</Heading>
            <Text style={headerSubtitle}>
              من {fromDate} إلى {toDate}
            </Text>
          </Section>

          <Section style={contentSection}>
            {/* 1. Subtotal by status */}
            <Section style={card}>
              <Text style={cardTitle}>١. إجمالي المبيعات (Subtotal) حسب الحالة</Text>
              {subtotalByStatus.map((item, i) => (
                <Row key={`sub-${i}`} style={dataRow}>
                  <Text style={statusLabel}>{getStatusLabel(item.status)}</Text>
                  <Text style={valueText}>{formatCurrency(item.value)}</Text>
                </Row>
              ))}
            </Section>

            {/* 2. Shipping by status */}
            <Section style={card}>
              <Text style={cardTitle}>٢. إجمالي الشحن حسب الحالة</Text>
              {shippingByStatus.map((item, i) => (
                <Row key={`ship-${i}`} style={dataRow}>
                  <Text style={statusLabel}>{getStatusLabel(item.status)}</Text>
                  <Text style={valueText}>{formatCurrency(item.value)}</Text>
                </Row>
              ))}
            </Section>

            {/* 3. Affiliate discount (delivered only) */}
            <Section style={card}>
              <Text style={cardTitle}>٣. نسبة الأفلييت (الطلبات المسلّمة فقط)</Text>
              <Row style={highlightRow}>
                <Text style={statusLabel}>تم التوصيل</Text>
                <Text style={highlightValue}>{formatCurrency(affiliateDiscountDelivered)}</Text>
              </Row>
            </Section>

            {/* 4. Client discount by status */}
            <Section style={card}>
              <Text style={cardTitle}>٤. نسبة خصم العميل حسب الحالة</Text>
              {clientDiscountByStatus.map((item, i) => (
                <Row key={`disc-${i}`} style={dataRow}>
                  <Text style={statusLabel}>{getStatusLabel(item.status)}</Text>
                  <Text style={valueText}>{formatCurrency(item.value)}</Text>
                </Row>
              ))}
            </Section>

            {/* 5. Gift wrapping by status */}
            <Section style={card}>
              <Text style={cardTitle}>٥. إجمالي التغليف المميز حسب الحالة</Text>
              {giftWrappingByStatus.map((item, i) => (
                <Row key={`gift-${i}`} style={dataRow}>
                  <Text style={statusLabel}>{getStatusLabel(item.status)}</Text>
                  <Text style={valueText}>{formatCurrency(item.value)}</Text>
                </Row>
              ))}
            </Section>

            {/* 6. Order count + details by status */}
            <Section style={card}>
              <Text style={cardTitle}>٦. عدد الطلبات وتفاصيلها حسب الحالة</Text>
              {orderIdsByStatus.length === 0 ? (
                <Text style={emptyText}>لا توجد طلبات في هذه الفترة</Text>
              ) : (
                orderIdsByStatus.map((group, i) => (
                  <Section key={`ids-${i}`} style={orderIdsGroup}>
                    <Text style={orderIdsStatusLabel}>
                      {getStatusLabel(group.status)} — {group.orders.length} طلب
                    </Text>
                    {group.orders.map((order, j) => (
                      <Section key={`o-${i}-${j}`} style={orderDetailBlock}>
                        <Text style={orderIdLine}>#{order.orderId}</Text>
                        <Text style={orderMetaLine}>
                          مبيعات: {formatCurrency(order.subtotal)} | شحن:{' '}
                          {formatCurrency(order.shipping)} | خصم عميل:{' '}
                          {formatCurrency(order.discount)}
                          {group.status === 'delivered'
                            ? ` | أفلييت: ${formatCurrency(order.discount)}`
                            : ''}{' '}
                          | تغليف: {formatCurrency(order.giftWrapping)}
                        </Text>
                      </Section>
                    ))}
                  </Section>
                ))
              )}
            </Section>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              تم إنشاء هذا التقرير تلقائياً بواسطة نظام PlanBlue
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminReportEmail;

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily:
    "'Cairo', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '10px 0',
  direction: 'rtl' as const,
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
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#f8fafc',
  margin: '0',
  fontSize: '22px',
  fontWeight: '700',
};

const headerSubtitle = {
  color: '#94a3b8',
  margin: '10px 0 0 0',
  fontSize: '14px',
};

const contentSection = {
  padding: '24px',
};

const card = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid #e2e8f0',
  marginBottom: '16px',
};

const cardTitle = {
  fontWeight: '700',
  fontSize: '14px',
  color: '#1e293b',
  margin: '0 0 12px 0',
};

const dataRow = {
  borderBottom: '1px solid #e2e8f0',
  padding: '10px 0',
};

const highlightRow = {
  padding: '12px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
};

const statusLabel = {
  color: '#64748b',
  fontWeight: '600',
  fontSize: '13px',
  margin: '0',
  float: 'right' as const,
};

const valueText = {
  color: '#0f172a',
  fontWeight: '700',
  fontSize: '13px',
  margin: '0',
  float: 'left' as const,
};

const highlightValue = {
  color: '#16a34a',
  fontWeight: '700',
  fontSize: '15px',
  margin: '0',
  float: 'left' as const,
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

const orderIdsGroup = {
  borderBottom: '1px solid #e2e8f0',
  padding: '10px 0',
};

const orderIdsStatusLabel = {
  color: '#64748b',
  fontWeight: '700',
  fontSize: '13px',
  margin: '0 0 6px 0',
};

const orderDetailBlock = {
  margin: '8px 0',
  padding: '8px 10px',
  backgroundColor: '#f1f5f9',
  borderRadius: '6px',
  borderRight: '3px solid #94a3b8',
};

const orderIdLine = {
  color: '#0f172a',
  fontWeight: '700',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0 0 4px 0',
  direction: 'ltr' as const,
  textAlign: 'right' as const,
};

const orderMetaLine = {
  color: '#334155',
  fontWeight: '500',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0',
  direction: 'ltr' as const,
  textAlign: 'right' as const,
  wordBreak: 'break-word' as const,
};

const emptyText = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0',
  textAlign: 'center' as const,
};

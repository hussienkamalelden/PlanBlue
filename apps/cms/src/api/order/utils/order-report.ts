import ExcelJS from 'exceljs';
import type { Core } from '@strapi/strapi';

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const HEADERS = [
  'تاريخ',
  'الحالة',
  'ID order',
  'سعر البيع',
  'سعر المنتج الاصلي مع + التشغيل',
  'لف هدايا مميز',
  'الربح قبل أي خصومات',
  'عمولة Affiliate بالجنية',
  'خصم العميل بالجنية',
  'تكلفة لف الهدايا المميز',
  'قيمة الشحن',
  'تكلفة العروض',
  'صافي الربح بعد الخصومات',
  'إعادة الاستثمار 50%',
  'الربح المتبقي 50%',
  'نصيب كل شريك (3 شركاء)',
  'اجمالي الاستثمار',
  'اجمالي الربح للشريك',
] as const;

// Column letters for formula references (A=1 … R=18)
const COL = {
  sellingPrice: 'D',
  originalWithOperation: 'E',
  premiumGiftWrapping: 'F',
  profitBeforeDiscounts: 'G',
  affiliateCommission: 'H',
  clientDiscount: 'I',
  giftWrappingCost: 'J',
  shipping: 'K',
  offersCost: 'L',
  netProfit: 'M',
  reinvestment: 'N',
  remainingProfit: 'O',
  partnerShare: 'P',
  totalReinvestment: 'Q',
  totalPartnerProfit: 'R',
} as const;

const MONEY_COLUMNS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

type OrderRow = {
  updatedAt: string | Date;
  status_type: string;
  order_id: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  gift_wrapping?: boolean;
  gift_wrapping_cost?: number;
  promo_code?: string | null;
};

function round(value: number): number {
  return Number(value.toFixed(2));
}

function formatOrderDate(updatedAt: string | Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(updatedAt));
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function setFormula(cell: ExcelJS.Cell, formula: string) {
  cell.value = { formula };
}

function applyMoneyFormat(row: ExcelJS.Row) {
  for (const columnIndex of MONEY_COLUMNS) {
    row.getCell(columnIndex).numFmt = '#,##0.00';
  }
}

function applyOrderRowFormulas(row: ExcelJS.Row, rowNumber: number) {
  const r = String(rowNumber);
  const isCancelled = `B${r}="ملغي"`;

  setFormula(
    row.getCell(5),
    `ROUND(${COL.sellingPrice}${r}*0.6,2)`,
  );
  setFormula(
    row.getCell(7),
    `ROUND(${COL.sellingPrice}${r}*0.4+${COL.premiumGiftWrapping}${r},2)`,
  );
  setFormula(
    row.getCell(13),
    `IF(${isCancelled},0,ROUND(${COL.profitBeforeDiscounts}${r}-${COL.affiliateCommission}${r}-${COL.clientDiscount}${r}-${COL.offersCost}${r}-${COL.giftWrappingCost}${r},2))`,
  );
  setFormula(
    row.getCell(14),
    `IF(${isCancelled},0,ROUND(${COL.netProfit}${r}/2,2))`,
  );
  setFormula(
    row.getCell(15),
    `IF(${isCancelled},0,ROUND(${COL.netProfit}${r}/2,2))`,
  );
  setFormula(
    row.getCell(16),
    `IF(${isCancelled},0,ROUND(${COL.remainingProfit}${r}/3,2))`,
  );
}

async function loadAffiliateCommissionByPromoCode(
  strapi: Core.Strapi,
): Promise<Map<string, number>> {
  const affiliates = await strapi.documents('api::affiliate.affiliate').findMany({
    populate: { promocodes: true },
    status: 'published',
  });

  const promoCommissionMap = new Map<string, number>();

  for (const affiliate of affiliates) {
    const commissionPercentage = Number(affiliate.commission_percentage ?? 0);

    for (const promo of affiliate.promocodes ?? []) {
      const code = promo.code?.trim()?.toLowerCase();
      if (code) {
        promoCommissionMap.set(code, commissionPercentage);
      }
    }
  }

  return promoCommissionMap;
}

function getAffiliateCommission(
  order: OrderRow,
  promoCommissionMap: Map<string, number>,
): number {
  const promoCode = order.promo_code?.trim()?.toLowerCase();
  if (!promoCode || !promoCommissionMap.has(promoCode)) {
    return 0;
  }

  const commissionPercentage = promoCommissionMap.get(promoCode) ?? 0;
  const subtotal = Number(order.subtotal ?? 0);

  return round((subtotal * commissionPercentage) / 100);
}

function getPremiumGiftWrapping(order: OrderRow): number {
  if (!order.gift_wrapping) {
    return 0;
  }

  return round(Number(order.gift_wrapping_cost ?? 0));
}

export async function generateOrderReportExcel(
  strapi: Core.Strapi,
  fromDate: string,
  toDate: string,
): Promise<{ buffer: Buffer; filename: string }> {
  const fromUTC = new Date(`${fromDate}T00:00:00.000+03:00`).toISOString();
  const toUTC = new Date(`${toDate}T23:59:59.999+03:00`).toISOString();

  const [orders, promoCommissionMap] = await Promise.all([
    strapi.db.query('api::order.order').findMany({
      where: {
        publishedAt: { $ne: null },
        $or: [
          {
            createdAt: {
              $gte: fromUTC,
              $lte: toUTC,
            },
          },
          {
            updatedAt: {
              $gte: fromUTC,
              $lte: toUTC,
            },
          },
        ],
      },
      orderBy: { updatedAt: 'asc' },
    }),
    loadAffiliateCommissionByPromoCode(strapi),
  ]);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير الطلبات', {
    views: [{ rightToLeft: true }],
  });

  worksheet.addRow([...HEADERS]);

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  const firstDataRow = 2;

  for (const order of orders as OrderRow[]) {
    const sellingPrice = round(Number(order.subtotal ?? 0));
    const affiliateCommission = getAffiliateCommission(order, promoCommissionMap);
    const clientDiscount = round(Number(order.discount_amount ?? 0));
    const shippingValue = round(Number(order.shipping_cost ?? 0));
    const premiumGiftWrapping = getPremiumGiftWrapping(order);

    const row = worksheet.addRow([
      formatOrderDate(order.updatedAt),
      getStatusLabel(order.status_type),
      String(order.order_id),
      sellingPrice,
      null,
      premiumGiftWrapping,
      null,
      affiliateCommission,
      clientDiscount,
      0,
      shippingValue,
      0,
      null,
      null,
      null,
      null,
      '',
      '',
    ]);

    const rowNumber = row.number;
    applyOrderRowFormulas(row, rowNumber);
    applyMoneyFormat(row);
  }

  const lastDataRow = worksheet.rowCount;
  const totalsRow = worksheet.addRow([
    'الإجمالي',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    null,
    null,
  ]);
  totalsRow.font = { bold: true };

  if (lastDataRow >= firstDataRow) {
    const statusRange = `B${firstDataRow}:B${lastDataRow}`;
    const deliveredStatus = `"${STATUS_LABELS.delivered}"`;

    setFormula(
      totalsRow.getCell(17),
      `SUMIF(${statusRange},${deliveredStatus},${COL.reinvestment}${firstDataRow}:${COL.reinvestment}${lastDataRow})`,
    );
    setFormula(
      totalsRow.getCell(18),
      `SUMIF(${statusRange},${deliveredStatus},${COL.partnerShare}${firstDataRow}:${COL.partnerShare}${lastDataRow})`,
    );
  }

  applyMoneyFormat(totalsRow);

  worksheet.columns = HEADERS.map((header) => ({
    width: Math.max(header.length + 4, 14),
  }));

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const filename =
    fromDate === toDate
      ? `planblue-report-${fromDate}.xlsx`
      : `planblue-report-${fromDate}-to-${toDate}.xlsx`;

  strapi.log.info(
    `[REPORT] Generated Excel report for ${fromDate} → ${toDate} (${orders.length} orders)`,
  );

  return { buffer, filename };
}

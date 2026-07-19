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
  'الربح قبل أي خصومات',
  'عمولة Affiliate بالجنية',
  'خصم العميل بالجنية',
  'قيمة لف الهدايا المميز',
  'قيمة الشحن',
  'تكلفة العروض',
  'صافي الربح بعد الخصومات',
  'إعادة الاستثمار 50%',
  'الربح المتبقي 50%',
  'نصيب كل شريك',
  'اجمالي الاستثمار',
  'اجمالي الربح للشريك',
] as const;

type OrderRow = {
  updatedAt: string | Date;
  status_type: string;
  order_id: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
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

function buildOrderCalculations(
  order: OrderRow,
  promoCommissionMap: Map<string, number>,
) {
  const sellingPrice = round(Number(order.subtotal ?? 0));
  const originalPriceWithOperation = round(sellingPrice * 0.6);
  const profitBeforeDiscounts = round(sellingPrice * 0.4);
  const affiliateCommission = getAffiliateCommission(order, promoCommissionMap);
  const clientDiscount = round(Number(order.discount_amount ?? 0));
  const giftWrappingValue = 0;
  const shippingValue = round(Number(order.shipping_cost ?? 0));
  const offersCost = 0;
  const netProfitAfterDiscounts = round(
    profitBeforeDiscounts -
      affiliateCommission -
      clientDiscount -
      offersCost -
      giftWrappingValue,
  );
  const reinvestment50 = round(netProfitAfterDiscounts / 2);
  const remainingProfit50 = round(netProfitAfterDiscounts / 2);
  const partnerShare = round(remainingProfit50 / 3);

  return {
    sellingPrice,
    originalPriceWithOperation,
    profitBeforeDiscounts,
    affiliateCommission,
    clientDiscount,
    giftWrappingValue,
    shippingValue,
    offersCost,
    netProfitAfterDiscounts,
    reinvestment50,
    remainingProfit50,
    partnerShare,
  };
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

  let totalReinvestment = 0;
  let totalPartnerProfit = 0;

  for (const order of orders as OrderRow[]) {
    const calculations = buildOrderCalculations(order, promoCommissionMap);

    totalReinvestment += calculations.reinvestment50;
    totalPartnerProfit += calculations.partnerShare;

    worksheet.addRow([
      formatOrderDate(order.updatedAt),
      getStatusLabel(order.status_type),
      String(order.order_id),
      calculations.sellingPrice,
      calculations.originalPriceWithOperation,
      calculations.profitBeforeDiscounts,
      calculations.affiliateCommission,
      calculations.clientDiscount,
      calculations.giftWrappingValue,
      calculations.shippingValue,
      calculations.offersCost,
      calculations.netProfitAfterDiscounts,
      calculations.reinvestment50,
      calculations.remainingProfit50,
      calculations.partnerShare,
      '',
      '',
    ]);
  }

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
    round(totalReinvestment),
    round(totalPartnerProfit),
  ]);
  totalsRow.font = { bold: true };

  worksheet.columns = HEADERS.map((header, index) => ({
    key: String(index + 1),
    width: header ? Math.max(header.length + 4, 14) : 4,
  }));

  for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex);

    for (let columnIndex = 4; columnIndex <= 15; columnIndex += 1) {
      const cell = row.getCell(columnIndex);
      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    }

    for (const columnIndex of [16, 17]) {
      const cell = row.getCell(columnIndex);
      if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    }
  }

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

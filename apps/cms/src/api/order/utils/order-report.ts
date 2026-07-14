import { render } from '@react-email/components';
import React from 'react';
import type { Core } from '@strapi/strapi';

import AdminReportEmail from '../../../emails/AdminReportEmail';

type StatusBreakdown = {
  status: string;
  value: number;
};

type OrderIdsByStatus = {
  status: string;
  orderIds: string[];
};

type ReportData = {
  fromDate: string;
  toDate: string;
  subtotalByStatus: StatusBreakdown[];
  shippingByStatus: StatusBreakdown[];
  affiliateDiscountDelivered: number;
  clientDiscountByStatus: StatusBreakdown[];
  giftWrappingByStatus: StatusBreakdown[];
  orderCountByStatus: StatusBreakdown[];
  orderIdsByStatus: OrderIdsByStatus[];
};

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const ADMIN_ORDER_EMAIL =
  process.env.ADMIN_ORDER_EMAIL ?? 'planbluestore@gmail.com';

export async function generateAndSendReport(
  strapi: Core.Strapi,
  fromDate: string,
  toDate: string,
): Promise<{ success: boolean; email: string }> {
  // Convert local Egypt time (UTC+3) to UTC for accurate date filtering
  const fromUTC = new Date(`${fromDate}T00:00:00.000+03:00`).toISOString();
  const toUTC = new Date(`${toDate}T23:59:59.999+03:00`).toISOString();

  const orders = await strapi.documents('api::order.order').findMany({
    filters: {
      createdAt: {
        $gte: fromUTC,
        $lte: toUTC,
      },
    },
    status: 'published',
  });

  const subtotalByStatus: StatusBreakdown[] = [];
  const shippingByStatus: StatusBreakdown[] = [];
  const clientDiscountByStatus: StatusBreakdown[] = [];
  const giftWrappingByStatus: StatusBreakdown[] = [];
  const orderCountByStatus: StatusBreakdown[] = [];
  const orderIdsByStatus: OrderIdsByStatus[] = [];
  let affiliateDiscountDelivered = 0;

  for (const status of ORDER_STATUSES) {
    const ordersForStatus = orders.filter(
      (order: any) => order.status_type === status,
    );

    if (ordersForStatus.length === 0) {
      continue;
    }

    let subtotalSum = 0;
    let shippingSum = 0;
    let discountSum = 0;
    let giftWrappingSum = 0;

    for (const order of ordersForStatus) {
      subtotalSum += Number(order.subtotal ?? 0);
      shippingSum += Number(order.shipping_cost ?? 0);
      discountSum += Number(order.discount_amount ?? 0);
      giftWrappingSum += Number(order.gift_wrapping_cost ?? 0);
    }

    subtotalByStatus.push({
      status,
      value: Number(subtotalSum.toFixed(2)),
    });

    shippingByStatus.push({
      status,
      value: Number(shippingSum.toFixed(2)),
    });

    clientDiscountByStatus.push({
      status,
      value: Number(discountSum.toFixed(2)),
    });

    giftWrappingByStatus.push({
      status,
      value: Number(giftWrappingSum.toFixed(2)),
    });

    orderCountByStatus.push({
      status,
      value: ordersForStatus.length,
    });

    orderIdsByStatus.push({
      status,
      orderIds: ordersForStatus
        .map((order: any) => String(order.order_id ?? ''))
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })),
    });

    if (status === 'delivered') {
      affiliateDiscountDelivered = Number(discountSum.toFixed(2));
    }
  }

  const reportData: ReportData = {
    fromDate,
    toDate,
    subtotalByStatus,
    shippingByStatus,
    affiliateDiscountDelivered,
    clientDiscountByStatus,
    giftWrappingByStatus,
    orderCountByStatus,
    orderIdsByStatus,
  };

  const emailHtml = await render(
    React.createElement(AdminReportEmail, reportData),
  );

  await strapi.plugins['email'].services.email.send({
    to: ADMIN_ORDER_EMAIL,
    from: process.env.RESEND_DEFAULT_FROM,
    subject: `تقرير الطلبات — من ${fromDate} إلى ${toDate}`,
    html: emailHtml,
  });

  strapi.log.info(
    `[REPORT] Sent report email for ${fromDate} → ${toDate} to ${ADMIN_ORDER_EMAIL}`,
  );

  return { success: true, email: ADMIN_ORDER_EMAIL };
}

import { render } from '@react-email/components';
import ClientOrderEmail from '../../../../emails/ClientOrderEmail';
import AdminOrderEmail from '../../../../emails/AdminOrderEmail';
import React from 'react';

export default {
  async afterCreate(event: any) {
    const { result } = event;

    try {
      // 1. sending an email to the customer (Customer Confirmation)
      const emailHtml = await render(
        React.createElement(ClientOrderEmail, {
          name: result.name,
          order_id: result.order_id,
          total: result.total,
          address: result.address,
          phone: result.phone,
          extra_notes: result.extra_notes,
          order_items: result.order_items,
          governorate: result.governorate,
          promo_code: result.promo_code,
        }),
      );
      // sending the email to the customer through Resend through the Strapi Service
      await strapi.plugins['email'].services.email.send({
        to: result.email,
        from: process.env.RESEND_DEFAULT_FROM,
        subject: `PlanBlue - Order Confirmation #${result.order_id}`,
        html: emailHtml, // here we send the HTML that was rendered
      });

      // 2. sending an email to the admin (Admin Notification)
      const adminEmailHtml = await render(
        React.createElement(AdminOrderEmail, {
          name: result.name,
          order_id: result.order_id,
          total: result.total,
          address: result.address,
          phone: result.phone,
          extra_notes: result.extra_notes,
          order_items: result.order_items,
          governorate: result.governorate,
          promo_code: result.promo_code,
        }),
      );
      await strapi.plugins['email'].services.email.send({
        to: 'planbluestore@gmail.com',
        from: process.env.RESEND_DEFAULT_FROM,
        subject: `New Order Received! Order #${result.order_id}`,
        html: adminEmailHtml,
      });
    } catch (error) {
      // if there is an error in the email server, the order should be updated normally but we print the error in the terminal
      strapi.log.error('Failed to send order emails:', error);
    }
  },
};

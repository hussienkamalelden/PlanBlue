import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::affiliate.affiliate',
  ({ strapi }) => ({
    async payout(ctx) {
      const { id } = ctx.params;

      const affiliate = await strapi.db
        .query('api::affiliate.affiliate')
        .findOne({ where: { documentId: id } });

      if (!affiliate) {
        return ctx.notFound('Affiliate not found');
      }

      const pendingCommission = Number(affiliate.current_pending_commission ?? 0);

      if (pendingCommission <= 0) {
        return ctx.badRequest('No pending commission to pay out');
      }

      const newTotalPaid =
        Number(affiliate.total_paid_commission ?? 0) + pendingCommission;

      await strapi.db.query('api::affiliate.affiliate').updateMany({
        where: { documentId: id },
        data: {
          total_paid_commission: Number(newTotalPaid.toFixed(2)),
          current_pending_commission: 0,
        },
      });

      return ctx.send({
        message: 'Payout successful',
        paid_amount: pendingCommission,
        new_total_paid: newTotalPaid,
      });
    },
  }),
);

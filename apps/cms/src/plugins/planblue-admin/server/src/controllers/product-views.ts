export default {
  async reset(ctx: { body: unknown }) {
    const { updatedCount } = await strapi
      .service('api::product.product')
      .resetAllViews();

    ctx.body = {
      data: {
        message: 'All product views have been reset to 0.',
        updatedCount,
      },
    };
  },
};

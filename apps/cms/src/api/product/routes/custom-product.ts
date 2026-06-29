export default {
  routes: [
    {
      method: 'POST',
      path: '/products/reset-views',
      handler: 'api::product.product.resetViews',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};

export default {
  routes: [
    {
      method: 'GET',
      path: '/product-search',
      handler: 'api::product.product.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
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

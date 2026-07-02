export default {
  routes: [
    {
      method: 'POST',
      path: '/affiliates/:id/payout',
      handler: 'affiliate.payout',
      config: {
        policies: [],
      },
    },
  ],
};

export default {
  routes: [
    {
      method: 'POST',
      path: '/affiliates/payout-all',
      handler: 'affiliate.payoutAll',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/affiliates/:id/payout',
      handler: 'affiliate.payout',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};

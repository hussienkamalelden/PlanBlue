export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/:id/resend-emails',
      handler: 'order.resendEmails',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/orders/generate-report',
      handler: 'order.generateReport',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};

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
  ],
};

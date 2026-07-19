export default ({ env }: { env: any }) => ({
  'planblue-admin': {
    enabled: true,
    resolve: './src/plugins/planblue-admin',
  },
  // upload plugin for cloudflare r2
  upload: {
    config: {
      provider: 'strapi-provider-cloudflare-r2',
      providerOptions: {
        accessKeyId: env('CLOUDFLARE_ACCESS_KEY_ID'),
        secretAccessKey: env('CLOUDFLARE_SECRET_ACCESS_KEY'),
        endpoint: env('CLOUDFLARE_ENDPOINT'),
        params: {
          Bucket: env('CLOUDFLARE_BUCKET_NAME'),
        },
        cloudflarePublicAccessUrl: env('CLOUDFLARE_PUBLIC_URL'),
      },
    },
  },
  // email plugin for resend
  email: {
    config: {
      provider: 'strapi-provider-email-resend',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'),
      },
      settings: {
        defaultFrom: env('RESEND_DEFAULT_FROM'),
        defaultReplyTo: env('RESEND_DEFAULT_REPLY_TO'),
      },
    },
  },
});

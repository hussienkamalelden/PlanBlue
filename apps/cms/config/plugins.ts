export default ({ env }: { env: any }) => ({
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
});
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'pub-eb8249647a93431092ad3c6652a821b0.r2.dev',
            '*.cloudflare.com',
            'https://*.cloudflarestorage.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'pub-eb8249647a93431092ad3c6652a821b0.r2.dev',
            '*.cloudflare.com',
            'https://*.cloudflarestorage.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::logger',
  'strapi::favicon',
  'strapi::public',
];

import type { StrapiApp } from '@strapi/strapi/admin';

import ResetProductViewsButton from './components/ResetProductViewsButton';

export default {
  config: {
    locales: ['en', 'ar'],
  },

  bootstrap(app: StrapiApp) {
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: 'reset-product-views',
      Component: ResetProductViewsButton,
    });
  },
};

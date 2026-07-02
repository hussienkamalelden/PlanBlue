import type { Schema, Struct } from '@strapi/strapi';

export interface AffiliateAffiliatePromo extends Struct.ComponentSchema {
  collectionName: 'components_affiliate_promos';
  info: {
    displayName: 'Affiliate Promo';
    icon: 'gift';
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    discount_percentage: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<10>;
  };
}

export interface OrdersOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_orders_order_items';
  info: {
    displayName: 'order-item';
    icon: 'bulletList';
  };
  attributes: {
    price_at_purchase: Schema.Attribute.Decimal & Schema.Attribute.Required;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    product_title: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'affiliate.affiliate-promo': AffiliateAffiliatePromo;
      'orders.order-item': OrdersOrderItem;
    }
  }
}

import type { Schema, Struct } from '@strapi/strapi';

export interface OrdersOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_orders_order_items';
  info: {
    displayName: 'order-item';
    icon: 'bulletList';
  };
  attributes: {
    price_at_purchase: Schema.Attribute.Decimal;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    product_title: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer &
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
      'orders.order-item': OrdersOrderItem;
    }
  }
}

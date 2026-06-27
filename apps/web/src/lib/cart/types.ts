// LocalStorage cart — no customer auth; implement in a later step

export type CartItem = {
  productId: string;
  quantity: number;
};

export const CART_STORAGE_KEY = "planblue_cart";

// Shared TypeScript types between Next.js and Strapi — define in later steps

export type GuestCheckout = {
  name: string;
  phone: string;
  email: string;
};

export type Marketer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  commissionPercent: number;
};

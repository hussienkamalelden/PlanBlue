export const PLANBLUE_WHATSAPP_NUMBER = '012-88-739-168';

export function getWhatsAppHref(number: string = PLANBLUE_WHATSAPP_NUMBER): string {
  const digits = number.replace(/\D/g, '');

  if (!digits) {
    return '#';
  }

  const international = digits.startsWith('0') ? `20${digits.slice(1)}` : digits;

  return `https://wa.me/${international}`;
}

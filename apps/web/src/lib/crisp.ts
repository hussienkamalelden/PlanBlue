export const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim() ?? '';

export function isCrispEnabled(): boolean {
  return CRISP_WEBSITE_ID.length > 0;
}

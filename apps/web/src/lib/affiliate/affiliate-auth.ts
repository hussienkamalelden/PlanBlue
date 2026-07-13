import bcrypt from 'bcryptjs';

/** Bcrypt hash for affiliate page access (password: hello123). Stored client-side only. */
export const AFFILIATE_PASSWORD_HASH =
  '$2b$10$kdCCWoSOZOaJAqu4YbzpTOCBghKENbw/GXGPDnbolKoQJDhckGPS.';

export const AFFILIATE_AUTH_STORAGE_KEY = 'planblue-affiliate-access';
export const AFFILIATE_AUTH_STORAGE_VALUE = 'granted';

export function isAffiliateAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    localStorage.getItem(AFFILIATE_AUTH_STORAGE_KEY) ===
    AFFILIATE_AUTH_STORAGE_VALUE
  );
}

export function markAffiliateAuthenticated(): void {
  localStorage.setItem(
    AFFILIATE_AUTH_STORAGE_KEY,
    AFFILIATE_AUTH_STORAGE_VALUE,
  );
}

export async function verifyAffiliatePassword(
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, AFFILIATE_PASSWORD_HASH);
}

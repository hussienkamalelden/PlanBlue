import {
  isProtectedPageAuthenticated,
  markProtectedPageAuthenticated,
  verifyProtectedPagePassword,
} from '@/lib/auth/protected-page-auth';
import { decodePasswordHashFromEnv } from '@/lib/auth/decode-password-hash';

export const AFFILIATE_PASSWORD_HASH = decodePasswordHashFromEnv(
  process.env.NEXT_PUBLIC_AFFILIATE_PASSWORD_HASH,
);

export const AFFILIATE_AUTH_STORAGE_KEY = 'planblue-affiliate-access';
export const AFFILIATE_AUTH_STORAGE_VALUE = 'granted';

export function isAffiliateAuthenticated(): boolean {
  return isProtectedPageAuthenticated(
    AFFILIATE_AUTH_STORAGE_KEY,
    AFFILIATE_AUTH_STORAGE_VALUE,
  );
}

export function markAffiliateAuthenticated(): void {
  markProtectedPageAuthenticated(
    AFFILIATE_AUTH_STORAGE_KEY,
    AFFILIATE_AUTH_STORAGE_VALUE,
  );
}

export async function verifyAffiliatePassword(
  password: string,
): Promise<boolean> {
  return verifyProtectedPagePassword(password, AFFILIATE_PASSWORD_HASH);
}

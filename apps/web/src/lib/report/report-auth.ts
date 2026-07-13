import {
  isProtectedPageAuthenticated,
  markProtectedPageAuthenticated,
  verifyProtectedPagePassword,
} from '@/lib/auth/protected-page-auth';
import { decodePasswordHashFromEnv } from '@/lib/auth/decode-password-hash';

export const REPORT_PASSWORD_HASH = decodePasswordHashFromEnv(
  process.env.NEXT_PUBLIC_REPORT_PASSWORD_HASH,
);

export const REPORT_AUTH_STORAGE_KEY = 'planblue-report-access';
export const REPORT_AUTH_STORAGE_VALUE = 'granted';

export function isReportAuthenticated(): boolean {
  return isProtectedPageAuthenticated(
    REPORT_AUTH_STORAGE_KEY,
    REPORT_AUTH_STORAGE_VALUE,
  );
}

export function markReportAuthenticated(): void {
  markProtectedPageAuthenticated(
    REPORT_AUTH_STORAGE_KEY,
    REPORT_AUTH_STORAGE_VALUE,
  );
}

export async function verifyReportPassword(password: string): Promise<boolean> {
  return verifyProtectedPagePassword(password, REPORT_PASSWORD_HASH);
}

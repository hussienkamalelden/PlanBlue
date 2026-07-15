/**
 * Bcrypt hashes contain `$` which Next.js dotenv expands and corrupts.
 * Store hashes base64-encoded in NEXT_PUBLIC_* env vars.
 */
export function decodePasswordHashFromEnv(
  encodedHash: string | undefined,
): string {
  if (!encodedHash) {
    return '';
  }

  try {
    if (typeof atob === 'function') {
      return atob(encodedHash);
    }

    return Buffer.from(encodedHash, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

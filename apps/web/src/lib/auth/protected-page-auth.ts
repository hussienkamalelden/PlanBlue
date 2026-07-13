import bcrypt from 'bcryptjs';

export function isProtectedPageAuthenticated(
  storageKey: string,
  storageValue: string,
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(storageKey) === storageValue;
}

export function markProtectedPageAuthenticated(
  storageKey: string,
  storageValue: string,
): void {
  localStorage.setItem(storageKey, storageValue);
}

export async function verifyProtectedPagePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (!passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}

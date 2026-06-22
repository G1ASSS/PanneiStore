export const DEV_ADMIN_EMAIL = 'admin@panneistore.com';
export const DEV_ADMIN_PASSWORD = 'Admin123!';

const SESSION_KEY = 'panneistore-dev-admin';

export function isDevAdminEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_ADMIN === 'true';
}

export function setDevAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function clearDevAdminSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function hasDevAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function isDevAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEV_ADMIN_EMAIL &&
    password === DEV_ADMIN_PASSWORD
  );
}

export function isDevAdminActive(role?: string): boolean {
  return role === 'ADMIN' || (isDevAdminEnabled() && hasDevAdminSession());
}

const CSRF_COOKIE = 'delfos_csrf';
const CSRF_STORAGE_KEY = 'admin_csrf';

export function getCsrfToken(): string {
  if (typeof document !== 'undefined') {
    const prefix = `${CSRF_COOKIE}=`;
    const fromCookie = document.cookie
      .split('; ')
      .find((part) => part.startsWith(prefix));
    if (fromCookie) {
      try {
        return decodeURIComponent(fromCookie.slice(prefix.length));
      } catch {
        return fromCookie.slice(prefix.length);
      }
    }
  }
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(CSRF_STORAGE_KEY) || '';
  }
  return '';
}

export function storeCsrfToken(token: string): void {
  if (typeof sessionStorage === 'undefined') return;
  if (token) {
    sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(CSRF_STORAGE_KEY);
  }
}

export function clearClientAuth(): void {
  storeCsrfToken('');
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem('admin_authenticated');
  sessionStorage.removeItem('admin_token');
}

/** Same-origin fetch that sends the httpOnly session cookie and CSRF header. */
export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const csrf = getCsrfToken();
  if (csrf) {
    headers.set('X-CSRF-Token', csrf);
  }
  return fetch(input, {
    ...init,
    credentials: 'same-origin',
    headers,
  });
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const res = await adminFetch('/api/admin/session');
    return res.ok;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await adminFetch('/api/admin/logout', { method: 'POST' });
  } catch {
    // still clear client state
  }
  clearClientAuth();
}

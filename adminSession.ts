import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const SESSION_COOKIE = 'delfos_admin_session';
export const CSRF_COOKIE = 'delfos_csrf';
export const CSRF_HEADER = 'x-csrf-token';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type SessionPayload = {
  v: 1;
  sub: 'admin';
  sid: string;
  csrf: string;
  iat: number;
  exp: number;
};

let ephemeralSecret: string | null = null;

export function getSessionSecret(): string {
  const fromEnv = process.env.SESSION_SECRET;
  if (typeof fromEnv === 'string' && fromEnv.length >= 16) {
    return fromEnv;
  }
  if (!ephemeralSecret) {
    ephemeralSecret = crypto.randomBytes(32).toString('hex');
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[auth] SESSION_SECRET ausente ou curto; sessões não sobrevivem a restart. Defina SESSION_SECRET (>=16 chars).'
      );
    }
  }
  return ephemeralSecret;
}

export function signSession(payload: SessionPayload, secret: string = getSessionSecret()): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token: string, secret: string = getSessionSecret()): SessionPayload | null {
  if (typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let given: Buffer;
  try {
    given = Buffer.from(sig, 'base64url');
  } catch {
    return null;
  }

  const expected = crypto.createHmac('sha256', secret).update(body).digest();
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (payload?.v !== 1 || payload.sub !== 'admin') return null;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    if (typeof payload.csrf !== 'string' || payload.csrf.length < 16) return null;
    if (typeof payload.sid !== 'string' || payload.sid.length < 8) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSession(now: number = Date.now()): {
  token: string;
  csrf: string;
  maxAgeSec: number;
} {
  const csrf = crypto.randomBytes(32).toString('base64url');
  const payload: SessionPayload = {
    v: 1,
    sub: 'admin',
    sid: crypto.randomBytes(16).toString('base64url'),
    csrf,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  return {
    token: signSession(payload),
    csrf,
    maxAgeSec: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function parseCookies(header?: string | string[]): Record<string, string> {
  const raw = Array.isArray(header) ? header.join('; ') : header || '';
  const out: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k) continue;
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return proto === 'https';
}

function cookieFlags(req: Request, maxAgeSec: number, httpOnly: boolean): string {
  const parts = ['Path=/', `Max-Age=${maxAgeSec}`, 'SameSite=Lax'];
  if (httpOnly) parts.unshift('HttpOnly');
  if (isHttpsRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookies(
  req: Request,
  res: Response,
  session: { token: string; csrf: string; maxAgeSec: number }
): void {
  res.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${session.token}; ${cookieFlags(req, session.maxAgeSec, true)}`
  );
  res.append(
    'Set-Cookie',
    `${CSRF_COOKIE}=${encodeURIComponent(session.csrf)}; ${cookieFlags(req, session.maxAgeSec, false)}`
  );
}

export function clearSessionCookies(req: Request, res: Response): void {
  res.append('Set-Cookie', `${SESSION_COOKIE}=; ${cookieFlags(req, 0, true)}`);
  res.append('Set-Cookie', `${CSRF_COOKIE}=; ${cookieFlags(req, 0, false)}`);
}

export const MIN_ADMIN_PASSWORD_LENGTH = 12;

export function isAdminPasswordConfigured(): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return typeof password === 'string' && password.length >= MIN_ADMIN_PASSWORD_LENGTH;
}

/** Timing-safe compare of SHA-256(provided) vs SHA-256(env). No default/backdoor. */
export function adminPasswordMatches(provided: unknown): boolean {
  if (!isAdminPasswordConfigured()) return false;
  if (typeof provided !== 'string' || provided.length === 0 || provided.length > 1024) {
    return false;
  }
  const expected = process.env.ADMIN_PASSWORD as string;
  const given = crypto.createHash('sha256').update(provided, 'utf8').digest();
  const want = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(given, want);
}

function readCsrfHeader(req: Request): string {
  const header = req.headers[CSRF_HEADER];
  if (typeof header === 'string') return header.trim();
  if (Array.isArray(header) && header[0]) return String(header[0]).trim();
  return '';
}

function tokensEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers?.cookie);
  const token = cookies[SESSION_COOKIE];
  const session = token ? verifySession(token) : null;
  const csrf = readCsrfHeader(req);

  if (!session || !csrf || !tokensEqual(csrf, session.csrf)) {
    res.status(401).json({ success: false, error: 'Não autenticado.' });
    return;
  }

  next();
}

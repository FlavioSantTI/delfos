import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';

export type RateLimitEntry = {
  count: number;
  resetTime: number;
};

export const RATE_LIMIT_MAX_KEYS = 10_000;

const persistPath = (): string =>
  process.env.RATE_LIMIT_FILE || path.join(process.cwd(), 'data', 'rate-limit.json');

const store = new Map<string, RateLimitEntry>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let loaded = false;

export function hashRateLimitKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function pruneRateLimitStore(
  map: Map<string, RateLimitEntry>,
  now: number,
  maxKeys: number = RATE_LIMIT_MAX_KEYS
): void {
  for (const [key, entry] of map.entries()) {
    if (now > entry.resetTime) {
      map.delete(key);
    }
  }
  while (map.size >= maxKeys) {
    let oldestKey: string | undefined;
    let oldest = Infinity;
    for (const [key, entry] of map.entries()) {
      if (entry.resetTime < oldest) {
        oldest = entry.resetTime;
        oldestKey = key;
      }
    }
    if (!oldestKey) break;
    map.delete(oldestKey);
  }
}

export function consumeRateLimit(
  map: Map<string, RateLimitEntry>,
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number,
  maxKeys: number = RATE_LIMIT_MAX_KEYS
): { allowed: boolean; retryAfterMs: number } {
  pruneRateLimitStore(map, now, maxKeys);
  const hashed = hashRateLimitKey(key);
  const entry = map.get(hashed);

  if (!entry || now > entry.resetTime) {
    map.set(hashed, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: Math.max(0, entry.resetTime - now) };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

export function serializeRateLimitStore(
  map: Map<string, RateLimitEntry>,
  now: number
): Record<string, RateLimitEntry> {
  const out: Record<string, RateLimitEntry> = {};
  for (const [key, entry] of map.entries()) {
    if (now <= entry.resetTime) {
      out[key] = entry;
    }
  }
  return out;
}

export function loadRateLimitStore(
  map: Map<string, RateLimitEntry>,
  raw: Record<string, RateLimitEntry>,
  now: number
): void {
  map.clear();
  for (const [key, entry] of Object.entries(raw || {})) {
    if (
      entry &&
      typeof entry.count === 'number' &&
      typeof entry.resetTime === 'number' &&
      now <= entry.resetTime
    ) {
      map.set(key, { count: entry.count, resetTime: entry.resetTime });
    }
  }
}

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  try {
    const file = persistPath();
    if (!fs.existsSync(file)) return;
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, RateLimitEntry>;
    loadRateLimitStore(store, raw, Date.now());
  } catch (error) {
    console.warn('[rate-limit] não foi possível ler o arquivo persistido:', error);
  }
}

function schedulePersist(): void {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const file = persistPath();
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      const body = JSON.stringify(serializeRateLimitStore(store, Date.now()));
      fs.writeFileSync(tmp, body, 'utf8');
      try {
        fs.renameSync(tmp, file);
      } catch {
        fs.copyFileSync(tmp, file);
        fs.unlinkSync(tmp);
      }
    } catch (error) {
      console.warn('[rate-limit] persistência falhou:', error);
    }
  }, 1000);
  if (typeof persistTimer === 'object' && 'unref' in persistTimer) {
    persistTimer.unref();
  }
}

export function clientIp(req: Request, trustProxy: boolean): string {
  if (trustProxy) {
    const raw = req.headers['x-forwarded-for'];
    const first = Array.isArray(raw) ? raw[0] : String(raw || '').split(',')[0].trim();
    if (first) return first;
  }
  return req.socket.remoteAddress || 'unknown';
}

export function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  customMessage?: string,
  trustProxy: boolean = process.env.TRUST_PROXY === '1'
) {
  ensureLoaded();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = clientIp(req, trustProxy);
    const key = `${req.path}_${ip}`;
    const result = consumeRateLimit(store, key, maxRequests, windowMs, Date.now());
    schedulePersist();

    if (!result.allowed) {
      res.setHeader('Retry-After', String(Math.ceil(result.retryAfterMs / 1000) || 1));
      return res.status(429).json({
        success: false,
        error:
          customMessage ||
          'Muitas requisições originadas deste IP. Aguarde alguns instantes antes de tentar novamente.',
      });
    }

    next();
  };
}

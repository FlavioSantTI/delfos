import assert from 'node:assert/strict';
import type { NextFunction, Request, Response } from 'express';
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SESSION_COOKIE,
  adminPasswordMatches,
  createAdminSession,
  isAdminPasswordConfigured,
  parseCookies,
  requireAdminSession,
  signSession,
  verifySession,
  type SessionPayload,
} from './adminSession.ts';

process.env.SESSION_SECRET = 'test-session-secret-at-least-16';

const validPayload: SessionPayload = {
  v: 1,
  sub: 'admin',
  sid: 'sidtest12',
  csrf: 'csrf-token-value-16',
  iat: Date.now(),
  exp: Date.now() + 60_000,
};

const token = signSession(validPayload);
assert.ok(verifySession(token), 'valid HMAC session must verify');
assert.equal(verifySession(token)?.csrf, validPayload.csrf);
assert.equal(verifySession('not-a-token'), null);
assert.equal(verifySession(token.slice(0, -2) + 'aa'), null);

const expired = signSession({ ...validPayload, exp: Date.now() - 1 });
assert.equal(verifySession(expired), null, 'expired session must fail');

const created = createAdminSession();
assert.ok(created.token.includes('.'));
assert.ok(created.csrf.length >= 16);
assert.ok(verifySession(created.token));

const cookies = parseCookies(`${SESSION_COOKIE}=abc; ${CSRF_COOKIE}=xyz`);
assert.equal(cookies[SESSION_COOKIE], 'abc');
assert.equal(cookies[CSRF_COOKIE], 'xyz');

type MockRes = Response & { statusCode: number; body: unknown };

function mockRes(): MockRes {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res as MockRes;
}

function runGate(req: Partial<Request>): { statusCode: number; body: unknown; nextCalled: boolean } {
  const res = mockRes();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };
  requireAdminSession({ headers: {}, ...req } as Request, res, next);
  return { statusCode: res.statusCode, body: res.body, nextCalled };
}

const unauth = runGate({});
assert.equal(unauth.statusCode, 401);
assert.equal(unauth.nextCalled, false);
assert.deepEqual(unauth.body, { success: false, error: 'Não autenticado.' });

const noCsrf = runGate({
  headers: { cookie: `${SESSION_COOKIE}=${created.token}` },
} as Partial<Request>);
assert.equal(noCsrf.statusCode, 401);
assert.equal(noCsrf.nextCalled, false);

const ok = runGate({
  headers: {
    cookie: `${SESSION_COOKIE}=${created.token}`,
    [CSRF_HEADER]: created.csrf,
  },
} as Partial<Request>);
assert.equal(ok.statusCode, 200);
assert.equal(ok.nextCalled, true);
assert.equal(ok.body, null);

const prevPassword = process.env.ADMIN_PASSWORD;
process.env.ADMIN_PASSWORD = 'strong-admin-pass';
assert.equal(isAdminPasswordConfigured(), true);
assert.equal(adminPasswordMatches('strong-admin-pass'), true);
assert.equal(adminPasswordMatches('wrong-password'), false);
assert.equal(adminPasswordMatches('admin123'), false);
assert.equal(adminPasswordMatches('flaviosantiago'), false);
process.env.ADMIN_PASSWORD = 'short';
assert.equal(isAdminPasswordConfigured(), false);
assert.equal(adminPasswordMatches('short'), false);
if (prevPassword === undefined) {
  delete process.env.ADMIN_PASSWORD;
} else {
  process.env.ADMIN_PASSWORD = prevPassword;
}

console.log('adminSession tests passed');

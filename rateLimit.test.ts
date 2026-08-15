import assert from 'node:assert/strict';
import {
  consumeRateLimit,
  hashRateLimitKey,
  loadRateLimitStore,
  pruneRateLimitStore,
  serializeRateLimitStore,
  type RateLimitEntry,
} from './rateLimit.ts';

const map = new Map<string, RateLimitEntry>();
const now = 1_000_000;

const first = consumeRateLimit(map, 'login_1.1.1.1', 2, 60_000, now);
assert.equal(first.allowed, true);
assert.equal(map.size, 1);

const second = consumeRateLimit(map, 'login_1.1.1.1', 2, 60_000, now + 10);
assert.equal(second.allowed, true);

const third = consumeRateLimit(map, 'login_1.1.1.1', 2, 60_000, now + 20);
assert.equal(third.allowed, false);
assert.ok(third.retryAfterMs > 0);

const other = consumeRateLimit(map, 'login_2.2.2.2', 2, 60_000, now + 20);
assert.equal(other.allowed, true);

const afterWindow = consumeRateLimit(map, 'login_1.1.1.1', 2, 60_000, now + 60_001);
assert.equal(afterWindow.allowed, true);

const bounded = new Map<string, RateLimitEntry>();
for (let i = 0; i < 5; i++) {
  consumeRateLimit(bounded, `k${i}`, 10, 60_000, now, 3);
}
assert.ok(bounded.size <= 3, 'store must evict when over maxKeys');

pruneRateLimitStore(bounded, now + 120_000, 3);
assert.equal(bounded.size, 0);

const snap = new Map<string, RateLimitEntry>();
consumeRateLimit(snap, 'persist_ip', 5, 60_000, now);
const serialized = serializeRateLimitStore(snap, now);
assert.ok(serialized[hashRateLimitKey('persist_ip')]);

const restored = new Map<string, RateLimitEntry>();
loadRateLimitStore(restored, serialized, now);
assert.equal(restored.size, 1);

const expiredDump = serializeRateLimitStore(snap, now + 120_000);
assert.equal(Object.keys(expiredDump).length, 0);

console.log('rateLimit tests passed');

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateBody, getUserId, DATE_RE } from '../api/lib.js';

describe('DATE_RE', () => {
    it('matches valid date strings', () => {
        assert.ok(DATE_RE.test('2026-07-15'));
        assert.ok(DATE_RE.test('2024-01-01'));
        assert.ok(DATE_RE.test('2030-12-31'));
    });

    it('rejects invalid date strings', () => {
        assert.ok(!DATE_RE.test('not-a-date'));
        assert.ok(!DATE_RE.test('2026-7-15'));
        assert.ok(!DATE_RE.test('2026/07/15'));
        assert.ok(!DATE_RE.test(''));
    });
});

describe('validateBody', () => {
    it('rejects null/undefined', () => {
        assert.equal(validateBody(null), false);
        assert.equal(validateBody(undefined), false);
    });

    it('rejects non-objects', () => {
        assert.equal(validateBody('string'), false);
        assert.equal(validateBody(42), false);
        assert.equal(validateBody([]), false);
    });

    it('accepts valid date keys with boolean values', () => {
        assert.equal(validateBody({
            '2026-07-15': { sleep: true, rope: false }
        }), true);
    });

    it('rejects invalid date keys', () => {
        assert.equal(validateBody({ 'not-a-date': { sleep: true } }), false);
        assert.equal(validateBody({ '2026-7-15': { sleep: true } }), false);
    });

    it('rejects non-boolean habit values', () => {
        assert.equal(validateBody({ '2026-07-15': { sleep: 'yes' } }), false);
        assert.equal(validateBody({ '2026-07-15': { sleep: 1 } }), false);
        assert.equal(validateBody({ '2026-07-15': { sleep: null } }), false);
    });

    it('rejects non-object habit entries', () => {
        assert.equal(validateBody({ '2026-07-15': 'string' }), false);
        assert.equal(validateBody({ '2026-07-15': [1, 2] }), false);
    });

    it('accepts valid _habits array', () => {
        assert.equal(validateBody({
            _habits: [{ id: 'test', emoji: '🧪', label: 'Test' }]
        }), true);
    });

    it('accepts _habits mixed with date keys', () => {
        assert.equal(validateBody({
            _habits: [{ id: 'test', emoji: '🧪', label: 'Test' }],
            '2026-07-15': { test: true }
        }), true);
    });

    it('rejects non-array _habits', () => {
        assert.equal(validateBody({ _habits: 'string' }), false);
        assert.equal(validateBody({ _habits: {} }), false);
    });

    it('rejects _habits with missing fields', () => {
        assert.equal(validateBody({ _habits: [{ emoji: '🧪', label: 'Test' }] }), false);
        assert.equal(validateBody({ _habits: [{ id: 'test', label: 'Test' }] }), false);
        assert.equal(validateBody({ _habits: [{ id: 'test', emoji: '🧪' }] }), false);
    });

    it('rejects _habits with non-string fields', () => {
        assert.equal(validateBody({ _habits: [{ id: 123, emoji: '🧪', label: 'Test' }] }), false);
    });

    it('accepts empty object', () => {
        assert.equal(validateBody({}), true);
    });
});

describe('getUserId', () => {
    it('returns default when no session', () => {
        const req = { query: {}, headers: { cookie: '' } };
        assert.equal(getUserId(req), 'default');
    });

    it('returns query user when no session', () => {
        const req = { query: { user: 'testuser' }, headers: { cookie: '' } };
        assert.equal(getUserId(req), 'testuser');
    });

    it('returns user ID from valid session cookie', () => {
        const payload = btoa(JSON.stringify({
            sub: 'user123',
            exp: Math.floor(Date.now() / 1000) + 9999
        }));
        const req = { query: {}, headers: { cookie: `session=${payload}` } };
        assert.equal(getUserId(req), 'user123');
    });

    it('returns default for expired session', () => {
        const payload = btoa(JSON.stringify({
            sub: 'user123',
            exp: 1
        }));
        const req = { query: {}, headers: { cookie: `session=${payload}` } };
        assert.equal(getUserId(req), 'default');
    });

    it('returns default for malformed session', () => {
        const req = { query: {}, headers: { cookie: 'session=garbage' } };
        assert.equal(getUserId(req), 'default');
    });

    it('ignores other cookies', () => {
        const req = { query: {}, headers: { cookie: 'other=value; foo=bar' } };
        assert.equal(getUserId(req), 'default');
    });
});
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDefaultLoginCredentials,
  getInitialLoginMode,
  getRememberedLoginEmail,
  rememberLoginEmail
} from '../src/lib/defaultLoginCredentials.ts';

test('prefers a configured default email over the remembered email', () => {
  const credentials = getDefaultLoginCredentials({
    VITE_DEFAULT_LOGIN_EMAIL: '  OWNER@QQ.COM  '
  }, 'remembered@qq.com');

  assert.deepEqual(credentials, {
    email: 'owner@qq.com'
  });
});

test('falls back to the remembered email when no default email is configured', () => {
  const credentials = getDefaultLoginCredentials({
    VITE_DEFAULT_LOGIN_EMAIL: '  '
  }, '  REMEMBERED@QQ.COM  ');

  assert.deepEqual(credentials, {
    email: 'remembered@qq.com'
  });
});

test('starts in password mode whenever an email is ready for browser autofill', () => {
  assert.equal(getInitialLoginMode({ email: 'owner@qq.com' }), 'password');
  assert.equal(getInitialLoginMode({ email: '' }), 'code');
});

test('reads and normalizes the last successful login email from storage', () => {
  const storage = {
    getItem: () => '  OWNER@QQ.COM  '
  };

  assert.equal(getRememberedLoginEmail(storage), 'owner@qq.com');
});

test('stores only a normalized successful login email', () => {
  const writes: Array<[string, string]> = [];
  const storage = {
    setItem: (key: string, value: string) => writes.push([key, value])
  };

  assert.equal(rememberLoginEmail(storage, '  OWNER@QQ.COM  '), 'owner@qq.com');
  assert.deepEqual(writes, [['design_life_user_email', 'owner@qq.com']]);
});

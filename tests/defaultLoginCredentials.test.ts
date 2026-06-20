import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDefaultLoginCredentials,
  getInitialLoginMode
} from '../src/lib/defaultLoginCredentials.ts';

test('reads default login credentials from local environment values', () => {
  const credentials = getDefaultLoginCredentials({
    VITE_DEFAULT_LOGIN_EMAIL: '  2421415030@qq.com  ',
    VITE_DEFAULT_LOGIN_PASSWORD: '  secret-password  '
  });

  assert.deepEqual(credentials, {
    email: '2421415030@qq.com',
    password: 'secret-password'
  });
});

test('ignores blank default login credential values', () => {
  const credentials = getDefaultLoginCredentials({
    VITE_DEFAULT_LOGIN_EMAIL: '  ',
    VITE_DEFAULT_LOGIN_PASSWORD: ''
  });

  assert.deepEqual(credentials, {
    email: '',
    password: ''
  });
});

test('starts in password mode only when a default password is configured', () => {
  assert.equal(getInitialLoginMode({ email: '2421415030@qq.com', password: 'secret-password' }), 'password');
  assert.equal(getInitialLoginMode({ email: '2421415030@qq.com', password: '' }), 'code');
});

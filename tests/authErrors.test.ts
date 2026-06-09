import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PASSWORD_LOGIN_DISABLED_MESSAGE,
  getErrorMessage,
  isPasswordLoginDisabledError
} from '../src/lib/authErrors.ts';

test('detects CloudBase password-login-disabled errors across nested payloads', () => {
  assert.equal(
    isPasswordLoginDisabledError({
      error: {
        message: '请联系开发者在身份源列表开启用户名密码登录'
      }
    }),
    true
  );

  assert.equal(
    isPasswordLoginDisabledError({
      error_description: 'Please enable username/password login in identity source'
    }),
    true
  );
});

test('does not classify unrelated authentication errors as password-login-disabled', () => {
  assert.equal(
    isPasswordLoginDisabledError({
      message: '验证码错误或已过期'
    }),
    false
  );
});

test('prefers CloudBase error text before fallback text', () => {
  assert.equal(getErrorMessage({ error: { message: '验证码错误' } }, '登录失败'), '验证码错误');
  assert.equal(getErrorMessage({}, '登录失败'), '登录失败');
});

test('exports the exact password-login-disabled guidance used by the login flow', () => {
  assert.equal(
    PASSWORD_LOGIN_DISABLED_MESSAGE,
    '当前环境未开启密码登录，请先使用邮箱验证码登录，或在云开发控制台 > 身份认证 > 身份源中开启“用户名密码登录”。'
  );
});

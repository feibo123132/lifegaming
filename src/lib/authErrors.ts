export const PASSWORD_LOGIN_DISABLED_MESSAGE =
  '当前环境未开启密码登录，请先使用邮箱验证码登录，或在云开发控制台 > 身份认证 > 身份源中开启“用户名密码登录”。';

export const getErrorMessage = (err: any, fallback: string) =>
  err?.message || err?.msg || err?.error_description || err?.error?.message || fallback;

const getFlattenErrorText = (err: any): string => {
  const pieces = [
    err?.message,
    err?.msg,
    err?.error_description,
    err?.error?.message,
    err?.error?.msg,
    err?.error?.error_description,
    err?.code,
    err?.error?.code,
    err?.error_code,
    err?.error?.error_code
  ].filter(Boolean);

  let raw = '';
  try {
    raw = JSON.stringify(err);
  } catch {
    raw = '';
  }

  return `${pieces.join(' | ')} ${raw}`.toLowerCase();
};

export const isPasswordLoginDisabledError = (err: any): boolean => {
  const text = getFlattenErrorText(err);
  return [
    '请联系开发者在身份源列表开启用户名密码登录',
    '开启用户名密码登录',
    'username/password login',
    'username password login',
    'enable username',
    'identity source'
  ].some((hint) => text.includes(hint.toLowerCase()));
};

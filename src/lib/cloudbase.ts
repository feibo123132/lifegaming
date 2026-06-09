import cloudbase from '@cloudbase/js-sdk';

export const ENV_ID = 'jieyou-3gr01mvob9ad92de';

export const app = cloudbase.init({
  env: ENV_ID,
  region: 'ap-shanghai',
  timeout: 300000
});

export const auth = app.auth({
  persistence: 'local'
});
